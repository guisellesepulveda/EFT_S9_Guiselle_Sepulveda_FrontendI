/* ==========================================================================
   GAME_CENTER · comun.js
   Funciones compartidas por todas las páginas del sitio:
   - Formato de precios
   - Fábrica de elementos DOM (crearElemento)
   - Plantillas de la navbar y del pie de página (crearNavbar, crearFooter)
   - Mensajes emergentes (toasts) construidos con createElement / appendChild
   - Carrito de compras persistente (localStorage)
   Se carga ANTES que los demás scripts porque los otros archivos lo usan.

   NOTA: en todo el proyecto el contenido dinámico se construye con nodos DOM
   (createElement + appendChild), nunca con innerHTML. Así el texto que llega
   de datos variables (JSON, formularios, localStorage) se inserta como texto
   y jamás se interpreta como HTML.
   ========================================================================== */

"use strict";

/* --------------------------------------------------------------------------
   1. UTILIDADES GENERALES
   -------------------------------------------------------------------------- */

/**
 * Convierte un número a formato de precio chileno. Ej: 64990 -> "$64.990"
 * @param {number} valor
 * @returns {string}
 */
function formatearPrecio(valor) {
    return "$" + Number(valor).toLocaleString("es-CL");
}

/**
 * Convierte un texto de precio a número. Ej: "$64.990" -> 64990
 * Se usa para leer los precios que ya estaban escritos en el HTML.
 * @param {string} texto
 * @returns {number}
 */
/**
 * Muestra precio normal (tachado) y precio oferta.
 * @param {number} normal
 * @param {number} oferta
 * @param {string} claseOferta  Clases del precio oferta
 * @returns {HTMLElement}
 */
function crearPrecios(normal, oferta, claseOferta) {
    return crearElemento("p", { clase: "bloque-precios" }, [
        crearElemento("del", { clase: "precio-normal", "aria-label": "Precio normal", texto: formatearPrecio(normal) }),
        crearElemento("span", { clase: claseOferta, "aria-label": "Precio oferta", texto: formatearPrecio(oferta) })
    ]);
}

function precioATexto(texto) {
    return Number(String(texto).replace(/[^0-9]/g, "")) || 0;
}

/* --------------------------------------------------------------------------
   2. FÁBRICA DE ELEMENTOS DOM
   Función única que usan todas las plantillas del proyecto: en vez de
   repetir createElement + setAttribute + appendChild en cada componente,
   cada plantilla describe su elemento y esta función lo construye.
   -------------------------------------------------------------------------- */

/**
 * Crea un elemento DOM con sus atributos e hijos.
 *
 * @param {string} etiqueta   Nombre de la etiqueta: "div", "button", "img"...
 * @param {Object} [opciones] Atributos del elemento:
 *   - clase: clases CSS (string)
 *   - texto: contenido de texto; se inserta con textContent, por lo que
 *            nunca se interpreta como HTML
 *   - datos: atributos data-*, ej. { id: 5 } escribe data-id="5"
 *   - cualquier otra clave se escribe como atributo (id, href, src, alt,
 *     type, aria-label...). true crea el atributo vacío (ej. disabled);
 *     false, null y undefined lo omiten.
 * @param {(Node|string)[]} [hijos] Nodos (o textos) que se agregan con appendChild
 * @returns {HTMLElement}
 */
function crearElemento(etiqueta, opciones = {}, hijos = []) {
    const elemento = document.createElement(etiqueta);

    Object.entries(opciones).forEach(function ([nombre, valor]) {
        if (valor === false || valor == null) return;

        if (nombre === "clase") {
            elemento.className = valor;
        } else if (nombre === "texto") {
            elemento.textContent = valor;
        } else if (nombre === "datos") {
            Object.entries(valor).forEach(function ([clave, dato]) {
                elemento.dataset[clave] = dato;
            });
        } else {
            elemento.setAttribute(nombre, valor === true ? "" : valor);
        }
    });

    hijos.forEach(function (hijo) {
        elemento.appendChild(typeof hijo === "string" ? document.createTextNode(hijo) : hijo);
    });

    return elemento;
}

/* --------------------------------------------------------------------------
   3. NAVBAR Y PIE DE PÁGINA (plantillas compartidas por todas las páginas)
   En el HTML sólo existen dos huecos: <div id="zona-navbar"> y
   <div id="zona-footer">. Cada página llama a montarNavbar() / montarFooter()
   al iniciar y estas funciones reemplazan el hueco por el elemento real.
   -------------------------------------------------------------------------- */

/**
 * Reemplaza el hueco #zona-navbar por la barra de navegación.
 * Se usa replaceWith (y no un contenedor extra) para que el <nav> quede como
 * hijo directo del body y su comportamiento sticky-top siga funcionando.
 * @param {Object} opciones  Ver crearNavbar
 */
function montarNavbar(opciones) {
    const zona = document.getElementById("zona-navbar");
    if (zona) zona.replaceWith(crearNavbar(opciones));
}

/** Reemplaza el hueco #zona-footer por el pie de página. */
function montarFooter() {
    const zona = document.getElementById("zona-footer");
    if (zona) zona.replaceWith(crearFooter());
}

/**
 * Plantilla de la barra de navegación (Bootstrap): se colapsa en pantallas
 * pequeñas. Lo que cambia entre páginas llega por parámetro.
 *
 * @param {Object} opciones
 * @param {string} opciones.marcaHref  Destino del logo "GAME_CENTER"
 * @param {Array}  opciones.enlaces    Cada elemento es { texto, href, activo? }
 *                 o, para un menú desplegable, { texto, href, subenlaces: [
 *                 { texto, href, filtro? } ] }
 * @param {Node}   opciones.carrito    Elemento del carrito (botón o enlace)
 * @returns {HTMLElement}
 */
function crearNavbar(opciones) {
    const items = opciones.enlaces.map(crearItemNavbar);
    items.push(crearElemento("li", { clase: "nav-item" }, [opciones.carrito]));

    return crearElemento("nav", {
        clase: "navbar navbar-expand-lg navbar-dark bg-dark sticky-top",
        "aria-label": "Menú principal"
    }, [
        crearElemento("div", { clase: "container" }, [
            crearElemento("a", { clase: "navbar-brand fw-bold", href: opciones.marcaHref, texto: "GAME_CENTER" }),
            crearElemento("button", {
                clase: "navbar-toggler",
                type: "button",
                "data-bs-toggle": "collapse",
                "data-bs-target": "#navbarNav",
                "aria-controls": "navbarNav",
                "aria-expanded": "false",
                "aria-label": "Abrir menú de navegación"
            }, [crearElemento("span", { clase: "navbar-toggler-icon" })]),
            crearElemento("div", { clase: "collapse navbar-collapse", id: "navbarNav" }, [
                crearElemento("ul", { clase: "navbar-nav ms-auto" }, items)
            ])
        ])
    ]);
}

/**
 * Plantilla de un elemento del menú: enlace simple o menú desplegable.
 * @param {{texto:string, href:string, activo?:boolean, subenlaces?:Array}} item
 * @returns {HTMLElement}
 */
function crearItemNavbar(item) {
    if (item.subenlaces) {
        return crearElemento("li", { clase: "nav-item dropdown" }, [
            crearElemento("a", {
                clase: "nav-link dropdown-toggle",
                href: item.href,
                role: "button",
                "data-bs-toggle": "dropdown",
                "aria-expanded": "false",
                texto: item.texto
            }),
            crearElemento("ul", { clase: "dropdown-menu" }, item.subenlaces.map(function (sub) {
                return crearElemento("li", {}, [
                    crearElemento("a", {
                        clase: "dropdown-item",
                        href: sub.href,
                        "data-nav-filtro": sub.filtro, // lo usa game.js para filtrar productos
                        texto: sub.texto
                    })
                ]);
            }))
        ]);
    }

    return crearElemento("li", { clase: "nav-item" }, [
        crearElemento("a", {
            clase: "nav-link" + (item.activo ? " active" : ""),
            "aria-current": item.activo ? "page" : null,
            href: item.href,
            texto: item.texto
        })
    ]);
}

/**
 * Plantilla del pie de página (Bootstrap): contacto y redes sociales.
 * @returns {HTMLElement}
 */
function crearFooter() {
    return crearElemento("footer", { clase: "bg-dark text-white text-center py-4 mt-5" }, [
        crearElemento("div", { clase: "container" }, [
            crearElemento("p", { clase: "mb-1", texto: "© 2026 GAME_CENTER. Todos los derechos reservados." }),
            crearElemento("p", {
                clase: "mb-1 text-secondary",
                texto: "Contacto: game_center@gmail.com | Dirección: Vicuña Mackenna 3035, La Florida"
            }),
            crearElemento("a", {
                href: "https://www.instagram.com",
                target: "_blank",
                rel: "noopener",
                clase: "text-warning text-decoration-none",
                texto: "Síguenos en redes sociales"
            }),
            crearElemento("div", { clase: "mt-3" }, [
                crearElemento("a", { href: "#top", clase: "btn btn-outline-light btn-sm", texto: "Volver arriba" })
            ])
        ])
    ]);
}

/* --------------------------------------------------------------------------
   4. MENSAJES EMERGENTES (toasts)
   El contenedor #contenedor-mensajes ya existe vacío en cada HTML.
   Cada mensaje es un nodo propio: se agrega con appendChild y, pasado el
   tiempo, se quita solo ese nodo (los demás mensajes no se tocan).
   -------------------------------------------------------------------------- */

/**
 * Muestra un mensaje flotante en la esquina de la pantalla.
 * @param {string} texto   Contenido del mensaje
 * @param {string} tipo    "exito" | "error" | "info"
 */
function mostrarMensaje(texto, tipo = "info") {
    const contenedor = document.getElementById("contenedor-mensajes");
    if (!contenedor) return;

    const mensaje = crearMensaje(texto, tipo);
    contenedor.appendChild(mensaje);

    // El mensaje se retira solo después de 3 segundos.
    setTimeout(function () {
        mensaje.remove();
    }, 3000);
}

/**
 * Plantilla de un mensaje flotante.
 * @param {string} texto
 * @param {string} tipo    "exito" | "error" | "info"
 * @returns {HTMLElement}
 */
function crearMensaje(texto, tipo) {
    return crearElemento("div", {
        clase: "mensaje-flotante mensaje-" + tipo,
        role: "status",
        texto: texto
    });
}

/* --------------------------------------------------------------------------
   4b. DATOS EXTERNOS: esquemas, validación y carga con fetch
   Todo JSON que llega de fuera se valida contra un esquema ANTES de usarse.
   El detalle técnico se registra en la consola (console.error); a la persona
   usuaria sólo se le muestra un mensaje claro con acciones (ver crearAvisoError).
   -------------------------------------------------------------------------- */

const CORREO_CONTACTO = "game_center@gmail.com";
const RUTA_IMAGEN = /^assets\/img\/[\w.-]+\.(jpe?g|png|webp)$/i;

/* Esquema: cada propiedad indica tipo y restricciones (min, entero, patron). */
const ESQUEMA_PRODUCTO = {
    id: { tipo: "number", entero: true, min: 1 },
    nombre: { tipo: "string" },
    titulo: { tipo: "string" },
    categoria: { tipo: "string" },
    plataforma: { tipo: "string" },
    precio: { tipo: "number", min: 0 },
    precioOferta: { tipo: "number", min: 0, maxCampo: "precio" },
    imagen: { tipo: "string", patron: RUTA_IMAGEN },
    alt: { tipo: "string" },
    resumen: { tipo: "string" },
    descripcion: { tipo: "string" }
};

const ESQUEMA_NOVEDAD = {
    id: { tipo: "number", entero: true, min: 1 },
    titulo: { tipo: "string" },
    categoria: { tipo: "string" },
    plataforma: { tipo: "string" },
    precio: { tipo: "number", min: 0 },
    stock: { tipo: "number", entero: true, min: 0 },
    imagen: { tipo: "string", patron: RUTA_IMAGEN },
    descripcion: { tipo: "string" }
};

/** Error de la carga de datos; "detalles" lista cada problema encontrado. */
class ErrorDatos extends Error {
    constructor(mensaje, detalles = []) {
        super(mensaje);
        this.name = "ErrorDatos";
        this.detalles = detalles;
    }
}

/**
 * Comprueba que un objeto cumpla el esquema.
 * @param {*} objeto
 * @param {Object} esquema
 * @returns {string[]} Problemas encontrados (vacío si es válido)
 */
function validarObjeto(objeto, esquema) {
    if (objeto === null || typeof objeto !== "object" || Array.isArray(objeto)) {
        return ["no es un objeto"];
    }

    const problemas = [];
    Object.entries(esquema).forEach(function ([campo, regla]) {
        const valor = objeto[campo];

        if (valor === undefined) {
            problemas.push('falta la propiedad "' + campo + '"');
        } else if (typeof valor !== regla.tipo || (regla.tipo === "number" && !Number.isFinite(valor))) {
            problemas.push('"' + campo + '" debe ser de tipo ' + regla.tipo);
        } else if (regla.tipo === "string" && valor.trim() === "") {
            problemas.push('"' + campo + '" no puede estar vacío');
        } else if (regla.entero && !Number.isInteger(valor)) {
            problemas.push('"' + campo + '" debe ser un entero');
        } else if (regla.min !== undefined && valor < regla.min) {
            problemas.push('"' + campo + '" debe ser mayor o igual a ' + regla.min);
        } else if (regla.maxCampo && valor > objeto[regla.maxCampo]) {
            problemas.push('"' + campo + '" no puede superar a "' + regla.maxCampo + '"');
        } else if (regla.patron && !regla.patron.test(valor)) {
            problemas.push('"' + campo + '" no tiene el formato esperado');
        }
    });
    return problemas;
}

/**
 * Valida que los datos sean una lista de objetos que cumplen el esquema.
 * @throws {ErrorDatos} si la estructura es inválida
 */
function validarLista(datos, esquema, nombre) {
    if (!Array.isArray(datos)) {
        throw new ErrorDatos(nombre + ": se esperaba una lista", ["la raíz del JSON no es un arreglo"]);
    }

    const detalles = [];
    const ids = new Set();
    datos.forEach(function (elemento, indice) {
        validarObjeto(elemento, esquema).forEach(function (problema) {
            detalles.push("[" + indice + "] " + problema);
        });
        if (elemento && ids.has(elemento.id)) detalles.push("[" + indice + "] id duplicado: " + elemento.id);
        if (elemento) ids.add(elemento.id);
    });

    if (detalles.length > 0) {
        throw new ErrorDatos(nombre + ": estructura inválida", detalles);
    }
    return datos;
}

/**
 * Pide un JSON con fetch y lo valida. Rechaza con ErrorDatos ante fallos de
 * red, de estado HTTP, de formato JSON o de esquema.
 * @returns {Promise<Array>}
 */
function cargarJSON(url, esquema, nombre) {
    return fetch(url)
        .then(function (respuesta) {
            if (!respuesta.ok) {
                throw new ErrorDatos(nombre + ": el servidor respondió " + respuesta.status);
            }
            return respuesta.json();
        })
        .then(datos => validarLista(datos, esquema, nombre));
}

/** Registra el error técnico en consola, separado del mensaje al usuario. */
function registrarError(contexto, error) {
    console.error("[GAME_CENTER] " + contexto + ":", error);
    if (error && error.detalles && error.detalles.length > 0) {
        console.error("Detalle de validación:\n - " + error.detalles.join("\n - "));
    }
    if (window.location.protocol === "file:") {
        console.warn("El sitio se abrió con file://; usa un servidor local (p. ej. Live Server) para que fetch pueda leer los JSON.");
    }
}

/**
 * Aviso de error con acciones: reintentar y contactar por correo.
 * @param {Object} opciones
 * @param {string} opciones.titulo
 * @param {string} opciones.mensaje      Texto claro, sin tecnicismos
 * @param {Function} [opciones.reintentar]
 * @returns {HTMLElement}
 */
function crearAvisoError({ titulo, mensaje, reintentar }) {
    const asunto = encodeURIComponent("Problema en el sitio: " + titulo);
    const acciones = [];

    if (reintentar) {
        const boton = crearElemento("button", { type: "button", clase: "btn btn-dark btn-sm", texto: "Reintentar" });
        boton.addEventListener("click", reintentar);
        acciones.push(boton);
    }
    acciones.push(crearElemento("a", {
        clase: "btn btn-outline-dark btn-sm",
        href: "mailto:" + CORREO_CONTACTO + "?subject=" + asunto,
        texto: "Contactar a soporte"
    }));

    return crearElemento("div", { clase: "aviso-error", role: "alert" }, [
        crearElemento("p", {}, [crearElemento("strong", { texto: titulo })]),
        crearElemento("p", { clase: "small mb-2", texto: mensaje }),
        crearElemento("div", { clase: "acciones-error" }, acciones)
    ]);
}

/* --------------------------------------------------------------------------
   5. CARRITO DE COMPRAS
   Se guarda en localStorage para que el contador siga igual al navegar
   entre index.html y las páginas de detalle.
   -------------------------------------------------------------------------- */

const Carrito = {

    CLAVE: "gamecenter_carrito",

    /** Lee el carrito guardado. Si hay datos corruptos devuelve una lista vacía. */
    obtener() {
        try {
            return JSON.parse(localStorage.getItem(this.CLAVE)) || [];
        } catch (error) {
            console.warn("No se pudo leer el carrito guardado:", error);
            return [];
        }
    },

    /** Guarda el carrito y avisa a la página para que refresque el contador. */
    guardar(items) {
        try {
            localStorage.setItem(this.CLAVE, JSON.stringify(items));
        } catch (error) {
            console.warn("No se pudo guardar el carrito:", error);
        }
        document.dispatchEvent(new CustomEvent("carrito:actualizado"));
    },

    /**
     * Agrega un producto. Si ya existe, sólo suma la cantidad.
     * @param {{id:string|number, nombre:string, precio:number}} producto
     * @param {number} cantidad
     */
    agregar(producto, cantidad = 1) {
        const items = this.obtener();
        const existente = items.find(item => String(item.id) === String(producto.id));

        if (existente) {
            existente.cantidad += cantidad;
        } else {
            items.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: cantidad
            });
        }

        this.guardar(items);
    },

    /** Elimina por completo un producto del carrito. */
    eliminar(id) {
        const items = this.obtener().filter(item => String(item.id) !== String(id));
        this.guardar(items);
    },

    /** Deja el carrito sin productos. */
    vaciar() {
        this.guardar([]);
    },

    /** Cantidad total de unidades (para el contador de la barra de navegación). */
    totalUnidades() {
        return this.obtener().reduce((suma, item) => suma + item.cantidad, 0);
    },

    /** Valor total a pagar. */
    totalPrecio() {
        return this.obtener().reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    }
};
