/* ==========================================================================
   GAME_CENTER · detalle.js
   Script de la página de detalle (detalle.html).

   Una única página sirve para todos los productos: el id llega en la URL
   (detalle.html?id=2), los datos se piden con fetch a productos.json y la
   página se construye con funciones plantilla.

   Funcionalidades:
   - Producto pintado desde el JSON según el id de la URL (Fetch API)
   - Contador de cantidad con botones + y - (click)
   - Subtotal que se recalcula solo (input)
   - Envío del formulario de compra con validación (submit)
   - Zoom de la imagen al pasar el mouse (mouseover / mouseout)
   - Productos relacionados traídos con la Fetch API

   Igual que en el resto del proyecto, el contenido dinámico se construye con
   nodos DOM (crearElemento, de comun.js) sobre huecos vacíos que ya trae el
   HTML. Lo que cambia con frecuencia (enlace del carrito, subtotal) se crea
   una sola vez y después sólo se actualiza su texto.
   ========================================================================== */

"use strict";

const URL_PRODUCTOS = "assets/data/productos.json";   // Productos con su detalle
const URL_CATALOGO = "assets/data/novedades.json";    // Fuente de los relacionados

document.addEventListener("DOMContentLoaded", iniciarDetalle);

/** Inicializa, en orden, cada funcionalidad de la página de detalle. */
function iniciarDetalle() {
    const zona = document.getElementById("zona-detalle");
    if (!zona) return;

    montarNavbarDetalle();
    montarFooter();
    mostrarEnlaceCarrito();
    cargarProducto(zona);
}

/**
 * Monta la navbar de la página de detalle (la plantilla está en comun.js).
 * Los enlaces apuntan al index porque estas secciones no existen aquí.
 */
function montarNavbarDetalle() {
    montarNavbar({
        marcaHref: "index.html",
        enlaces: [
            { texto: "Inicio", href: "index.html" },
            { texto: "Productos", href: "index.html#productos" },
            { texto: "Contacto", href: "mailto:game_center@gmail.com?subject=Consulta%20desde%20el%20sitio%20web" }
        ],
        carrito: crearEnlaceCarrito()
    });
}

/* --------------------------------------------------------------------------
   0. PRODUCTO: se busca por el id de la URL y se pinta con plantillas
   -------------------------------------------------------------------------- */

/**
 * Pide productos.json y muestra el producto cuyo id viene en la URL.
 * @param {HTMLElement} zona  Hueco donde se pinta el detalle
 */
function cargarProducto(zona) {
    const id = new URLSearchParams(window.location.search).get("id");

    zona.replaceChildren(crearElemento("p", { clase: "cargando", texto: "Cargando producto..." }));

    cargarJSON(URL_PRODUCTOS, ESQUEMA_PRODUCTO, "productos.json")
        .then(function (productos) {
            const producto = productos.find(item => String(item.id) === String(id));
            if (!producto) {
                mostrarErrorProducto(zona, "No encontramos el producto que buscas.");
                return;
            }
            // El carrito y el subtotal usan el precio oferta como precio de venta.
            mostrarProducto(zona, { ...producto, precioNormal: producto.precio, precio: producto.precioOferta });
        })
        .catch(function (error) {
            registrarError("No se pudo cargar el producto", error);
            mostrarMensaje("No pudimos cargar el producto.", "error");
            zona.replaceChildren(crearAvisoError({
                titulo: "No pudimos cargar el producto",
                mensaje: "Reintenta la carga o escríbenos si el problema continúa.",
                reintentar: () => cargarProducto(zona)
            }));
        });
}

/**
 * Pinta el detalle y activa las funcionalidades que dependen de él.
 * @param {HTMLElement} zona
 * @param {{id:number, nombre:string, titulo:string, precio:number}} producto
 */
function mostrarProducto(zona, producto) {
    document.title = producto.titulo + " - GAME_CENTER";
    zona.replaceChildren(crearDetalleProducto(producto));

    iniciarZoomImagen();
    iniciarFormularioCompra(producto);
    cargarRelacionados(producto.id);
}

/** Avisa con un toast y deja en la página un mensaje con el camino de vuelta. */
function mostrarErrorProducto(zona, texto) {
    mostrarMensaje(texto, "error");
    zona.replaceChildren(crearAvisoProducto(texto));
}

/**
 * Plantilla del detalle completo de un producto.
 * @param {Object} producto  Objeto recibido desde productos.json
 * @returns {HTMLElement}
 */
function crearDetalleProducto(producto) {
    return crearElemento("section", { clase: "detalle-producto-container" }, [
        crearElemento("div", { clase: "detalle-imagen" }, [
            crearElemento("img", { src: producto.imagen, alt: producto.alt })
        ]),
        crearElemento("div", { clase: "detalle-info" }, [
            crearElemento("h2", { texto: producto.titulo }),
            crearPrecios(producto.precioNormal, producto.precio, "precio-detalle"),
            crearElemento("p", { clase: "descripcion-larga", texto: producto.descripcion }),
            crearFormularioCompra(),
            // Aquí JavaScript escribe el subtotal
            crearElemento("div", { id: "zona-subtotal" })
        ])
    ]);
}

/**
 * Plantilla del formulario de compra. Los botones - y + se agregan después
 * en los huecos #zona-menos y #zona-mas (ver agregarBotonesCantidad).
 */
function crearFormularioCompra() {
    return crearElemento("form", { clase: "compra-acciones", id: "form-compra", novalidate: true }, [
        crearElemento("label", { for: "cantidad", texto: "Cantidad:" }),
        crearElemento("span", { id: "zona-menos" }),
        crearElemento("input", {
            type: "number", id: "cantidad", name: "cantidad", value: 1, min: 1, max: 10
        }),
        crearElemento("span", { id: "zona-mas" }),
        crearElemento("button", { type: "submit", clase: "btn-agregar", texto: "Agregar al carrito" })
    ]);
}

/** Plantilla del aviso que se ve cuando el producto no se puede mostrar. */
function crearAvisoProducto(texto) {
    return crearElemento("div", { clase: "aviso-error" }, [
        crearElemento("p", { texto: texto }),
        crearElemento("a", { href: "index.html#productos", clase: "btn btn-dark btn-sm", texto: "Volver a los productos" })
    ]);
}

/* --------------------------------------------------------------------------
   1. ENLACE AL CARRITO EN EL MENÚ (se crea con la navbar, aquí se mantiene al día)
   -------------------------------------------------------------------------- */

function mostrarEnlaceCarrito() {
    const enlace = document.getElementById("enlace-carrito");
    if (!enlace) return;

    // Cada vez que el carrito cambia sólo se actualiza el texto del enlace.
    document.addEventListener("carrito:actualizado", function () {
        enlace.textContent = textoEnlaceCarrito();
    });
}

/** Plantilla del enlace al carrito que se ve en el menú. */
function crearEnlaceCarrito() {
    return crearElemento("a", {
        id: "enlace-carrito",
        clase: "nav-link",
        href: "index.html#productos",
        texto: textoEnlaceCarrito()
    });
}

/** Texto del enlace con el total de unidades del carrito. */
function textoEnlaceCarrito() {
    return "Carrito (" + Carrito.totalUnidades() + ")";
}

/* --------------------------------------------------------------------------
   2. ZOOM DE LA IMAGEN (mouseover / mouseout)
   -------------------------------------------------------------------------- */

function iniciarZoomImagen() {
    const imagen = document.querySelector(".detalle-imagen img");
    if (!imagen) return;

    imagen.addEventListener("mouseover", function () {
        imagen.classList.add("imagen-zoom");
    });
    imagen.addEventListener("mouseout", function () {
        imagen.classList.remove("imagen-zoom");
    });
}

/* --------------------------------------------------------------------------
   3. FORMULARIO DE COMPRA: botones +/-, subtotal y submit
   -------------------------------------------------------------------------- */

function iniciarFormularioCompra(producto) {
    const formulario = document.getElementById("form-compra");
    const campoCantidad = document.getElementById("cantidad");
    if (!formulario || !campoCantidad) return;

    agregarBotonesCantidad(formulario, campoCantidad);

    campoCantidad.addEventListener("input", function () {
        actualizarSubtotal(producto, campoCantidad);
    });
    actualizarSubtotal(producto, campoCantidad);

    // SUBMIT: se valida la cantidad antes de agregar al carrito.
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const cantidad = Number(campoCantidad.value);
        if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 10) {
            campoCantidad.classList.add("campo-invalido");
            mostrarMensaje("Ingresa una cantidad entre 1 y 10 unidades.", "error");
            return;
        }

        campoCantidad.classList.remove("campo-invalido");
        Carrito.agregar(producto, cantidad);
        mostrarMensaje(cantidad + " x " + producto.nombre + " agregado al carrito.", "exito");
        actualizarSubtotal(producto, campoCantidad);
    });
}

/** Refresca el texto del subtotal con la cantidad actual. */
function actualizarSubtotal(producto, campoCantidad) {
    const zona = document.getElementById("zona-subtotal");
    if (!zona) return;

    // El párrafo se crea la primera vez; después sólo cambia su texto.
    let parrafo = zona.querySelector(".subtotal");
    if (!parrafo) {
        parrafo = crearElemento("p", { clase: "subtotal" });
        zona.appendChild(parrafo);
    }

    const cantidad = obtenerCantidadValida(campoCantidad);
    parrafo.textContent = "Subtotal: " + formatearPrecio(producto.precio * cantidad);
}

/**
 * Agrega los botones - y + en los huecos que rodean al campo cantidad
 * y registra un único listener de click (delegación en el formulario).
 */
function agregarBotonesCantidad(formulario, campoCantidad) {
    document.getElementById("zona-menos").replaceChildren(crearBotonCantidad("−", -1, "Disminuir cantidad"));
    document.getElementById("zona-mas").replaceChildren(crearBotonCantidad("+", 1, "Aumentar cantidad"));

    // CLICK: un solo listener atiende los dos botones.
    formulario.addEventListener("click", function (evento) {
        const boton = evento.target.closest(".btn-cantidad");
        if (!boton) return;
        cambiarCantidad(campoCantidad, Number(boton.dataset.paso));
    });
}

/** Plantilla reutilizable para no repetir el código de cada botón. */
function crearBotonCantidad(texto, paso, descripcion) {
    return crearElemento("button", {
        type: "button",
        clase: "btn-cantidad",
        datos: { paso: paso },
        "aria-label": descripcion,
        texto: texto
    });
}

/** Suma o resta unidades respetando los límites del campo (1 a 10). */
function cambiarCantidad(campoCantidad, paso) {
    const actual = obtenerCantidadValida(campoCantidad);
    const nueva = Math.min(10, Math.max(1, actual + paso));

    campoCantidad.value = nueva;
    campoCantidad.classList.remove("campo-invalido");
    campoCantidad.dispatchEvent(new Event("input")); // recalcula el subtotal
}

/** Devuelve la cantidad escrita, o 1 si el valor no es utilizable. */
function obtenerCantidadValida(campoCantidad) {
    const valor = Number(campoCantidad.value);
    return Number.isInteger(valor) && valor >= 1 ? valor : 1;
}

/* --------------------------------------------------------------------------
   4. FETCH API: productos relacionados
   -------------------------------------------------------------------------- */

/**
 * Pide el catálogo externo y muestra hasta 3 productos distintos al actual.
 * @param {string} idActual
 */
function cargarRelacionados(idActual) {
    const zona = document.getElementById("zona-relacionados");
    if (!zona) return;

    pintarSeccionRelacionados(zona, crearElemento("p", {
        clase: "cargando",
        texto: "Cargando sugerencias..."
    }));

    cargarJSON(URL_CATALOGO, ESQUEMA_NOVEDAD, "novedades.json")
        .then(function (catalogo) {
            const sugerencias = catalogo
                .filter(item => String(item.id) !== String(idActual))
                .slice(0, 3);
            pintarRelacionados(zona, sugerencias);
        })
        .catch(function (error) {
            registrarError("No se pudieron cargar los relacionados", error);
            mostrarMensaje("No pudimos cargar las sugerencias.", "error");
            pintarSeccionRelacionados(zona, crearAvisoError({
                titulo: "No pudimos cargar las sugerencias",
                mensaje: "Puedes reintentar o escribirnos si el problema continúa.",
                reintentar: () => cargarRelacionados(idActual)
            }));
        });
}

/**
 * Deja la sección con su título y el contenido indicado. Los tres estados
 * (cargando, error, lista) comparten el mismo título, así que se arma aquí.
 * @param {HTMLElement} zona
 * @param {HTMLElement} contenido
 */
function pintarSeccionRelacionados(zona, contenido) {
    zona.replaceChildren(
        crearElemento("h2", { texto: "También te puede interesar" }),
        contenido
    );
}

/** Dibuja la lista de productos sugeridos dentro de la sección recibida. */
function pintarRelacionados(zona, productos) {
    pintarSeccionRelacionados(
        zona,
        crearElemento("div", { clase: "lista-relacionados" }, productos.map(crearTarjetaRelacionada))
    );
}

/**
 * Plantilla de una tarjeta de producto relacionado.
 * @param {Object} producto
 * @returns {HTMLElement}
 */
function crearTarjetaRelacionada(producto) {
    return crearElemento("article", { clase: "tarjeta-relacionada" }, [
        crearElemento("img", { src: producto.imagen, alt: producto.titulo }),
        crearElemento("h3", { texto: producto.titulo }),
        crearElemento("p", { clase: "precio", texto: formatearPrecio(producto.precio) })
    ]);
}
