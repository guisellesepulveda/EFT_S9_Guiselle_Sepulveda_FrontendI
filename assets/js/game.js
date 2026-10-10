/* ==========================================================================
   GAME_CENTER · game.js
   Script de la página principal (index.html).

   Flujo de trabajo:
   1. Se espera a que el DOM esté listo (DOMContentLoaded).
   2. Se inicializan por separado: carrito, productos, filtros, formulario.
   3. Se piden los datos externos con la Fetch API y se pintan en el DOM.


   ========================================================================== */

"use strict";

/* Rutas de los archivos externos (se cargan con fetch y se validan). */
const URL_PRODUCTOS = "assets/data/productos.json";
const URL_NOVEDADES = "assets/data/novedades.json";

/* Punto de entrada: nada se ejecuta antes de que exista el HTML. */
document.addEventListener("DOMContentLoaded", iniciarPagina);

/** Llama de forma ordenada a cada bloque de funcionalidad. */
function iniciarPagina() {
    // Primero el layout: el resto de bloques busca elementos de la navbar.
    montarNavbarInicio();
    montarFooter();

    iniciarCarrito();
    iniciarProductos();
    iniciarFormularioContacto();
    cargarProductos();
    cargarNovedades();
}

/* ==========================================================================
   0. NAVBAR DE LA PÁGINA PRINCIPAL
   La plantilla (crearNavbar) está en comun.js; aquí sólo se indica qué
   enlaces lleva esta página.
   ========================================================================== */

/** Monta la navbar con las secciones de la página y las categorías simuladas. */
function montarNavbarInicio() {
    montarNavbar({
        marcaHref: "#top",
        enlaces: [
            { texto: "Inicio", href: "#top", activo: true },
            { texto: "Destacados", href: "#carrusel" },
            { texto: "Productos", href: "#productos" },
            {
                // Categorías simuladas: al elegir una, iniciarBarraFiltros aplica el filtro.
                texto: "Categorías",
                href: "#productos",
                subenlaces: [
                    { texto: "Consolas", href: "#productos", filtro: "Consolas" },
                    { texto: "Juegos", href: "#productos", filtro: "Juegos" },
                    { texto: "Accesorios", href: "#productos", filtro: "Accesorios" }
                ]
            },
            { texto: "Novedades", href: "#novedades" },
            { texto: "Contacto", href: "#contacto" }
        ],
        carrito: crearBotonCarrito()
    });
}

/** Plantilla del botón del carrito; su número lo actualiza actualizarContador. */
function crearBotonCarrito() {
    return crearElemento("button", {
        id: "btn-carrito",
        type: "button",
        clase: "btn btn-warning btn-sm ms-lg-3 mt-2 mt-lg-0"
    }, [
        "Carrito ",
        crearElemento("span", { id: "contador-carrito", clase: "badge bg-dark", texto: "0" })
    ]);
}

/* ==========================================================================
   1. CARRITO: contador de la navbar y panel lateral
   Eventos usados: click (abrir, cerrar, eliminar, vaciar)
   ========================================================================== */

function iniciarCarrito() {
    const boton = document.getElementById("btn-carrito");
    const panel = document.getElementById("panel-carrito");
    if (!boton || !panel) return;

    // CLICK: abrir / cerrar el panel del carrito.
    boton.addEventListener("click", function () {
        panel.classList.toggle("panel-abierto");
        pintarCarrito();
    });

    document.getElementById("cerrar-carrito").addEventListener("click", function () {
        panel.classList.remove("panel-abierto");
    });

    // CLICK: vaciar el carrito completo.
    document.getElementById("vaciar-carrito").addEventListener("click", function () {
        if (Carrito.totalUnidades() === 0) {
            mostrarMensaje("El carrito ya está vacío.", "info");
            return;
        }
        Carrito.vaciar();
        mostrarMensaje("Carrito vaciado.", "info");
    });

    /* Delegación de eventos: un solo listener para todos los botones
       "eliminar", incluso los que se agregan después al DOM. */
    document.getElementById("lista-carrito").addEventListener("click", function (evento) {
        const botonEliminar = evento.target.closest(".btn-quitar");
        if (!botonEliminar) return;
        Carrito.eliminar(botonEliminar.dataset.id);
        mostrarMensaje("Producto eliminado del carrito.", "info");
    });

    // Cada vez que cambia el carrito se refresca la vista.
    document.addEventListener("carrito:actualizado", function () {
        actualizarContador();
        pintarCarrito();
    });

    actualizarContador();
}

/** Actualiza el número que se ve junto al ícono del carrito. */
function actualizarContador() {
    const contador = document.getElementById("contador-carrito");
    if (!contador) return;
    contador.textContent = Carrito.totalUnidades();
}

/** Dibuja la lista de productos del carrito dentro del panel lateral. */
function pintarCarrito() {
    const lista = document.getElementById("lista-carrito");
    const total = document.getElementById("total-carrito");
    if (!lista) return;

    const items = Carrito.obtener();

    // replaceChildren descarta las filas anteriores y agrega las nuevas.
    if (items.length === 0) {
        lista.replaceChildren(crearAvisoCarritoVacio());
    } else {
        lista.replaceChildren(...items.map(crearFilaCarrito));
    }

    total.textContent = formatearPrecio(Carrito.totalPrecio());
}

/**
 * Plantilla de una fila del carrito.
 * @param {{id:string|number, nombre:string, precio:number, cantidad:number}} item
 * @returns {HTMLElement}
 */
function crearFilaCarrito(item) {
    return crearElemento("div", { clase: "item-carrito" }, [
        crearElemento("div", {}, [
            crearElemento("strong", { clase: "d-block", texto: item.nombre }),
            crearElemento("span", {
                clase: "small text-muted",
                texto: item.cantidad + " x " + formatearPrecio(item.precio)
            })
        ]),
        crearElemento("button", {
            clase: "btn-quitar",
            datos: { id: item.id },
            "aria-label": "Quitar " + item.nombre,
            texto: "×"
        })
    ]);
}

/** Plantilla del texto que se ve cuando el carrito no tiene productos. */
function crearAvisoCarritoVacio() {
    return crearElemento("p", {
        clase: "text-muted small mb-0",
        texto: "Todavía no has agregado productos."
    });
}

/* ==========================================================================
   2. PRODUCTOS DESTACADOS
   Eventos usados: click (agregar al carrito) y mouseover / mouseout (resaltar)
   ========================================================================== */

function iniciarProductos() {
    const seccion = document.getElementById("productos");
    if (!seccion) return;

    // CLICK: un único listener para los botones "Agregar" de todas las tarjetas.
    seccion.addEventListener("click", function (evento) {
        const boton = evento.target.closest(".btn-agregar-card");
        if (!boton) return;

        const tarjeta = boton.closest(".card");
        Carrito.agregar({
            id: tarjeta.dataset.id,
            nombre: tarjeta.dataset.nombre,
            precio: Number(tarjeta.dataset.precio)
        });
        mostrarMensaje(tarjeta.dataset.nombre + " se agregó al carrito.", "exito");
    });

    // MOUSEOVER / MOUSEOUT (delegados: las tarjetas se crean después del fetch).
    seccion.addEventListener("mouseover", function (evento) {
        const tarjeta = evento.target.closest("#grilla-productos .card");
        if (!tarjeta) return;
        tarjeta.classList.add("card-resaltada");
        mostrarEtiquetaPlataforma(tarjeta, true);
    });
    seccion.addEventListener("mouseout", function (evento) {
        const tarjeta = evento.target.closest("#grilla-productos .card");
        if (!tarjeta) return;
        tarjeta.classList.remove("card-resaltada");
        mostrarEtiquetaPlataforma(tarjeta, false);
    });
}

/** Carga los productos desde productos.json, los valida y pinta carrusel y tarjetas. */
function cargarProductos() {
    const estado = document.getElementById("zona-estado-productos");
    const carrusel = document.getElementById("gameCarousel");
    if (!estado) return;

    estado.replaceChildren(crearElemento("p", { clase: "cargando", texto: "Cargando productos..." }));

    cargarJSON(URL_PRODUCTOS, ESQUEMA_PRODUCTO, "productos.json")
        .then(function (productos) {
            estado.replaceChildren();
            if (carrusel) carrusel.classList.remove("d-none");
            pintarCarrusel(productos);
            pintarProductos(productos);
            iniciarBarraFiltros();
        })
        .catch(function (error) {
            registrarError("No se pudo cargar productos.json", error);
            if (carrusel) carrusel.classList.add("d-none");
            document.getElementById("grilla-productos").replaceChildren();
            document.getElementById("barra-filtros").replaceChildren();
            mostrarMensaje("No pudimos cargar los productos.", "error");
            estado.replaceChildren(crearAvisoError({
                titulo: "No pudimos cargar los productos",
                mensaje: mensajeDeError(error),
                reintentar: cargarProductos
            }));
        });
}

/** Mensaje comprensible según el tipo de fallo (el detalle técnico va a consola). */
function mensajeDeError(error) {
    if (error instanceof ErrorDatos && error.detalles.length > 0) {
        return "La información recibida no tiene el formato esperado. Puedes reintentar o avisarnos para corregirlo.";
    }
    return "No hay conexión con el catálogo en este momento. Revisa tu conexión y reintenta, o escríbenos si el problema continúa.";
}

/** Genera indicadores y slides del carrusel a partir de los productos. */
function pintarCarrusel(productos) {
    document.getElementById("carrusel-indicadores").replaceChildren(...productos.map(function (p, i) {
        return crearElemento("button", {
            type: "button",
            "data-bs-target": "#gameCarousel",
            "data-bs-slide-to": i,
            clase: i === 0 ? "active" : null,
            "aria-current": i === 0 ? "true" : null,
            "aria-label": "Slide " + (i + 1)
        });
    }));

    document.getElementById("carrusel-slides").replaceChildren(...productos.map(function (p, i) {
        return crearElemento("div", { clase: "carousel-item" + (i === 0 ? " active" : "") }, [
            crearElemento("img", { src: p.imagen, clase: "d-block w-100 object-fit-contain carrusel-img", alt: p.alt }),
            crearElemento("div", { clase: "carousel-caption d-none d-md-block bg-dark bg-opacity-75 rounded p-2" }, [
                crearElemento("h5", { texto: p.nombre }),
                crearElemento("p", { clase: "mb-0 text-warning fw-bold" }, [
                    crearElemento("del", { clase: "precio-normal me-2", texto: formatearPrecio(p.precio) }),
                    formatearPrecio(p.precioOferta)
                ])
            ])
        ]);
    }));

    // El carrusel se inicia aquí porque sus slides no existían al cargar la página.
    bootstrap.Carousel.getOrCreateInstance("#gameCarousel", { interval: 3000, ride: "carousel" });
}

/** Pinta una tarjeta por producto en la grilla. */
function pintarProductos(productos) {
    document.getElementById("grilla-productos").replaceChildren(...productos.map(crearTarjetaProducto));
}

/**
 * Plantilla de la tarjeta de un producto destacado.
 * @param {Object} p  Producto validado de productos.json
 * @returns {HTMLElement}
 */
function crearTarjetaProducto(p) {
    return crearElemento("div", { clase: "col-12 col-sm-6 col-lg-3", datos: { categoria: p.categoria } }, [
        crearElemento("div", {
            clase: "card h-100 shadow-sm border-0",
            datos: { id: p.id, nombre: p.nombre, precio: p.precioOferta, categoria: p.categoria, plataforma: p.plataforma }
        }, [
            crearElemento("span", { clase: "zona-etiqueta" }),
            crearElemento("img", { src: p.imagen, clase: "card-img-top p-3 card-producto-img", alt: p.alt }),
            crearElemento("div", { clase: "card-body d-flex flex-column" }, [
                crearElemento("h3", { clase: "card-title fs-6 fw-bold", texto: p.nombre }),
                crearPrecios(p.precio, p.precioOferta, "text-warning fw-bold fs-5"),
                crearElemento("p", { clase: "card-text small text-muted flex-grow-1", texto: p.resumen }),
                crearElemento("a", { href: "detalle.html?id=" + p.id, clase: "btn btn-dark w-100 mt-auto", texto: "Ver detalle" }),
                crearElemento("button", { type: "button", clase: "btn btn-outline-dark w-100 mt-2 btn-agregar-card", texto: "Agregar al carrito" })
            ])
        ])
    ]);
}

/**
 * Pinta o borra la etiqueta flotante que aparece al pasar el mouse.
 * El hueco .zona-etiqueta ya existe dentro de cada tarjeta del HTML.
 * @param {HTMLElement} tarjeta
 * @param {boolean} visible
 */
function mostrarEtiquetaPlataforma(tarjeta, visible) {
    const zona = tarjeta.querySelector(".zona-etiqueta");
    if (!zona) return;

    const texto = tarjeta.dataset.plataforma || tarjeta.dataset.categoria || "";
    if (visible) {
        zona.replaceChildren(crearElemento("span", { clase: "etiqueta-plataforma", texto: texto }));
    } else {
        zona.replaceChildren();
    }
}

/* ==========================================================================
   3. BARRA DE FILTROS Y BUSCADOR (su contenido lo genera JavaScript)
   Eventos usados: click (filtrar por categoría, en los botones y en el menú
   "Categorías" de la navbar), submit (formulario de búsqueda) e input
   (filtrar mientras se escribe)
   ========================================================================== */

function iniciarBarraFiltros() {
    const seccion = document.getElementById("productos");
    const barra = document.getElementById("barra-filtros");
    if (!seccion || !barra) return;

    // Sólo las columnas de la grilla (las tarjetas también tienen data-categoria).
    const columnas = Array.from(seccion.querySelectorAll("#grilla-productos > [data-categoria]"));
    if (columnas.length === 0) return;

    // Las categorías se obtienen de los propios productos: no se repiten a mano.
    const categorias = ["Todos", ...new Set(columnas.map(col => col.dataset.categoria))];

    // Botones + formulario de búsqueda construidos como nodos y agregados a la barra.
    const grupoBotones = crearElemento("div", { clase: "grupo-filtros" }, categorias.map(crearBotonFiltro));
    const formulario = crearFormularioBusqueda();
    const buscador = formulario.querySelector("#buscador");
    barra.replaceChildren(grupoBotones, formulario);

    /** Devuelve la categoría que tiene activa la barra de botones. */
    function categoriaActiva() {
        return grupoBotones.querySelector(".btn-filtro.activo").dataset.filtro;
    }

    /** Activa una categoría: marca su botón, limpia el buscador y filtra. */
    function aplicarFiltro(categoria) {
        grupoBotones.querySelectorAll(".btn-filtro").forEach(function (boton) {
            boton.classList.toggle("activo", boton.dataset.filtro === categoria);
        });
        buscador.value = "";
        filtrarProductos(columnas, categoria, "");
    }

    // CLICK: filtrar por categoría con los botones de la barra
    grupoBotones.addEventListener("click", function (evento) {
        const boton = evento.target.closest(".btn-filtro");
        if (!boton) return;
        aplicarFiltro(boton.dataset.filtro);
    });

    // CLICK: filtrar por categoría desde el menú "Categorías" de la navbar
    document.querySelectorAll("[data-nav-filtro]").forEach(function (enlace) {
        enlace.addEventListener("click", function () {
            aplicarFiltro(enlace.dataset.navFiltro);
        });
    });

    // SUBMIT: procesar el formulario de búsqueda (Enter o botón "Buscar")
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault(); // evita que la página se recargue

        const encontrados = filtrarProductos(columnas, categoriaActiva(), buscador.value);
        if (encontrados === 0) {
            mostrarMensaje("No encontramos productos con ese criterio.", "info");
        } else {
            mostrarMensaje(encontrados + (encontrados === 1 ? " producto encontrado." : " productos encontrados."), "exito");
        }
    });

    // INPUT: además, se filtra mientras se escribe
    buscador.addEventListener("input", function () {
        filtrarProductos(columnas, categoriaActiva(), buscador.value);
    });
}

/**
 * Plantilla de un botón de filtro (evita repetir el mismo código).
 * @param {string} categoria
 * @param {number} indice   El primero ("Todos") queda activo
 * @returns {HTMLElement}
 */
function crearBotonFiltro(categoria, indice) {
    return crearElemento("button", {
        type: "button",
        clase: "btn-filtro" + (indice === 0 ? " activo" : ""),
        datos: { filtro: categoria },
        texto: categoria
    });
}

/** Plantilla del formulario de búsqueda: campo de texto + botón "Buscar". */
function crearFormularioBusqueda() {
    return crearElemento("form", { clase: "form-buscador", role: "search" }, [
        crearElemento("input", {
            type: "search",
            id: "buscador",
            name: "busqueda",
            clase: "campo-buscador",
            placeholder: "Buscar producto...",
            "aria-label": "Buscar producto"
        }),
        crearElemento("button", {
            type: "submit",
            clase: "btn btn-dark btn-sm rounded-pill px-3",
            texto: "Buscar"
        })
    ]);
}

/**
 * Muestra u oculta las tarjetas según la categoría elegida y el texto buscado.
 * @param {HTMLElement[]} columnas  Columnas que contienen cada tarjeta
 * @param {string} categoria        Categoría seleccionada ("Todos" muestra todo)
 * @param {string} texto            Texto escrito en el buscador
 * @returns {number}                Cantidad de productos que quedaron visibles
 */
function filtrarProductos(columnas, categoria, texto) {
    const busqueda = texto.trim().toLowerCase();
    let visibles = 0;

    columnas.forEach(function (columna) {
        const tarjeta = columna.querySelector(".card");
        if (!tarjeta) return;

        const nombre = tarjeta.dataset.nombre.toLowerCase();
        const coincideCategoria = categoria === "Todos" || columna.dataset.categoria === categoria;
        const coincideTexto = nombre.includes(busqueda);

        const mostrar = coincideCategoria && coincideTexto;
        columna.classList.toggle("oculto", !mostrar);
        if (mostrar) visibles++;
    });

    mostrarAvisoSinResultados(visibles === 0);
    return visibles;
}

/** Agrega o quita el aviso "sin resultados" bajo la grilla de productos. */
function mostrarAvisoSinResultados(mostrar) {
    const zona = document.getElementById("zona-sin-resultados");
    if (!zona) return;

    if (mostrar) {
        zona.replaceChildren(crearAvisoVacio("No encontramos productos con ese criterio."));
    } else {
        zona.replaceChildren();
    }
}

/**
 * Plantilla del aviso gris que se muestra cuando no hay nada que listar.
 * @param {string} texto
 * @returns {HTMLElement}
 */
function crearAvisoVacio(texto) {
    return crearElemento("p", { clase: "aviso-vacio", texto: texto });
}

/* ==========================================================================
   4. FORMULARIO DE CONTACTO
   Evento usado: submit (con validación propia antes de "enviar")
   ========================================================================== */

function iniciarFormularioContacto() {
    const formulario = document.getElementById("form-contacto");
    if (!formulario) return;

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault(); // evita que la página se recargue

        const nombre = formulario.nombre.value.trim();
        const correo = formulario.correo.value.trim();
        const mensaje = formulario.mensaje.value.trim();
        const errores = validarContacto(nombre, correo, mensaje);

        limpiarErrores(formulario);

        if (errores.length > 0) {
            errores.forEach(error => pintarError(formulario, error.campo, error.texto));
            mostrarMensaje("Revisa los datos del formulario.", "error");
            return;
        }

        // Todo correcto: se muestra un resumen pintado dinámicamente.
        mostrarResumenContacto(nombre, correo);
        formulario.reset();
        mostrarMensaje("¡Mensaje enviado! Te responderemos pronto.", "exito");
    });
}

/**
 * Revisa los datos del formulario y devuelve la lista de errores encontrados.
 * @returns {{campo:string, texto:string}[]}
 */
function validarContacto(nombre, correo, mensaje) {
    const errores = [];
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (nombre.length < 3) {
        errores.push({ campo: "nombre", texto: "Escribe tu nombre (mínimo 3 caracteres)." });
    }
    if (!formatoCorreo.test(correo)) {
        errores.push({ campo: "correo", texto: "El correo no tiene un formato válido." });
    }
    if (mensaje.length < 10) {
        errores.push({ campo: "mensaje", texto: "Cuéntanos un poco más (mínimo 10 caracteres)." });
    }
    return errores;
}

/** Escribe el texto de error en el hueco que hay debajo de cada campo. */
function pintarError(formulario, campo, texto) {
    formulario.elements[campo].classList.add("campo-invalido");

    const zona = document.getElementById("error-" + campo);
    if (zona) zona.replaceChildren(crearElemento("p", { clase: "texto-error", texto: texto }));
}

/** Borra los mensajes de error de un intento anterior. */
function limpiarErrores(formulario) {
    formulario.querySelectorAll(".zona-error").forEach(zona => zona.replaceChildren());
    formulario.querySelectorAll(".campo-invalido").forEach(campo => campo.classList.remove("campo-invalido"));
}

/** Pinta el recuadro de confirmación que se ve al enviar correctamente. */
function mostrarResumenContacto(nombre, correo) {
    const contenedor = document.getElementById("resultado-contacto");

    // replaceChildren reemplaza automáticamente el resumen anterior.
    contenedor.replaceChildren(crearResumenContacto(nombre, correo));
}

/**
 * Plantilla del recuadro de confirmación del formulario de contacto.
 * El nombre y el correo los escribe la persona usuaria: se insertan como texto.
 * @param {string} nombre
 * @param {string} correo
 * @returns {HTMLElement}
 */
function crearResumenContacto(nombre, correo) {
    return crearElemento("div", { clase: "resumen-contacto" }, [
        crearElemento("h3", { texto: "Gracias, " + nombre }),
        crearElemento("p", {}, [
            "Hemos registrado tu consulta y responderemos a ",
            crearElemento("strong", { texto: correo }),
            "."
        ])
    ]);
}

/* ==========================================================================
   5. FETCH API: novedades cargadas desde un archivo externo
   Manejo de promesas con .then() / .catch() / .finally()
   ========================================================================== */

function cargarNovedades() {
    const seccion = document.getElementById("novedades");
    if (!seccion) return;

    // La estructura se pinta una sola vez (al reintentar ya existe).
    if (!document.getElementById("grilla-novedades")) {
        construirEstructuraNovedades(seccion);
    }
    document.getElementById("zona-error-novedades").replaceChildren();
    mostrarCargando(true);

    cargarJSON(URL_NOVEDADES, ESQUEMA_NOVEDAD, "novedades.json")
        .then(function (novedades) {
            document.getElementById("zona-error-novedades").replaceChildren();
            pintarNovedades(novedades);
        })
        .catch(function (error) {
            registrarError("No se pudieron cargar las novedades", error);
            mostrarErrorNovedades(error);
        })
        .finally(function () {
            // Se ejecuta siempre, haya funcionado o no la carga.
            mostrarCargando(false);
        });
}

/** Construye con nodos el título y los contenedores de la sección Novedades. */
function construirEstructuraNovedades(seccion) {
    seccion.replaceChildren(
        crearElemento("h2", { clase: "text-center fw-bold mb-2", texto: "Novedades del catálogo" }),
        crearElemento("p", {
            clase: "text-center text-muted mb-4",
            texto: "Estos productos se cargan dinámicamente desde un archivo externo."
        }),
        crearElemento("div", { id: "estado-novedades" }, [
            crearElemento("div", { id: "zona-cargando" }),
            crearElemento("div", { id: "zona-error-novedades" })
        ]),
        crearElemento("div", { id: "grilla-novedades", clase: "row g-4" })
    );
}

/** Muestra u oculta el indicador de carga (sin borrar el aviso de error). */
function mostrarCargando(visible) {
    const zona = document.getElementById("zona-cargando");
    if (!zona) return;

    if (visible) {
        zona.replaceChildren(crearElemento("p", { clase: "cargando", texto: "Cargando novedades..." }));
    } else {
        zona.replaceChildren();
    }
}

/**
 * Recorre los datos recibidos y pinta una tarjeta por cada producto.
 * @param {Array} novedades
 */
function pintarNovedades(novedades) {
    const grilla = document.getElementById("grilla-novedades");

    if (!Array.isArray(novedades) || novedades.length === 0) {
        grilla.replaceChildren(crearAvisoVacio("Por ahora no hay novedades disponibles."));
        return;
    }

    grilla.replaceChildren(...novedades.map(crearTarjetaNovedad));
}

/**
 * Plantilla de la tarjeta de una novedad.
 * Los datos vienen del JSON: cada uno se inserta como texto o como atributo.
 * @param {Object} producto  Objeto recibido desde el JSON
 * @returns {HTMLElement}    Columna lista para agregar a la grilla
 */
function crearTarjetaNovedad(producto) {
    const agotado = producto.stock === 0;

    return crearElemento("div", { clase: "col-12 col-sm-6 col-lg-4" }, [
        crearElemento("article", {
            clase: "card h-100 shadow-sm border-0 card-novedad",
            datos: { id: producto.id, nombre: producto.titulo, precio: producto.precio }
        }, [
            crearElemento("img", {
                src: producto.imagen,
                clase: "card-img-top p-3",
                alt: producto.titulo
            }),
            crearElemento("div", { clase: "card-body d-flex flex-column" }, [
                crearElemento("span", { clase: "etiqueta-categoria", texto: producto.categoria }),
                crearElemento("h3", { clase: "card-title fs-6 fw-bold mt-2", texto: producto.titulo }),
                crearElemento("p", {
                    clase: "text-warning fw-bold fs-5 mb-1",
                    texto: formatearPrecio(producto.precio)
                }),
                crearElemento("p", { clase: "small text-muted flex-grow-1", texto: producto.descripcion }),
                crearElemento("p", { clase: "small mb-2" }, [
                    "Plataforma: ",
                    crearElemento("strong", { texto: producto.plataforma })
                ]),
                crearElemento("button", {
                    type: "button",
                    clase: "btn btn-dark w-100 mt-auto btn-agregar-novedad",
                    disabled: agotado,
                    texto: agotado ? "Sin stock" : "Agregar al carrito"
                })
            ])
        ])
    ]);
}

/* CLICK y MOUSEOVER sobre las tarjetas pintadas por fetch.
   Se usa delegación en document para que funcionen aunque las tarjetas
   todavía no existan cuando se registra el listener. */
document.addEventListener("click", function (evento) {
    const boton = evento.target.closest(".btn-agregar-novedad");
    if (!boton) return;

    const tarjeta = boton.closest(".card-novedad");
    Carrito.agregar({
        id: tarjeta.dataset.id,
        nombre: tarjeta.dataset.nombre,
        precio: Number(tarjeta.dataset.precio)
    });
    mostrarMensaje(tarjeta.dataset.nombre + " se agregó al carrito.", "exito");
});

document.addEventListener("mouseover", function (evento) {
    const tarjeta = evento.target.closest(".card-novedad");
    if (tarjeta) tarjeta.classList.add("card-resaltada");
});

document.addEventListener("mouseout", function (evento) {
    const tarjeta = evento.target.closest(".card-novedad");
    if (tarjeta) tarjeta.classList.remove("card-resaltada");
});

/**
 * Avisa del error con un toast breve y pinta, en la sección, un aviso con
 * las acciones "Reintentar" y "Contactar a soporte".
 * @param {Error} error
 */
function mostrarErrorNovedades(error) {
    mostrarMensaje("No pudimos cargar las novedades.", "error");

    document.getElementById("grilla-novedades").replaceChildren();
    document.getElementById("zona-error-novedades").replaceChildren(crearAvisoError({
        titulo: "No pudimos cargar las novedades",
        mensaje: mensajeDeError(error),
        reintentar: cargarNovedades
    }));
}
