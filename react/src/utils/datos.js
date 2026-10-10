/* Carga y validación de los JSON externos (mismos esquemas que el proyecto original). */

export const CORREO_CONTACTO = "game_center@gmail.com";
export const URL_PRODUCTOS = import.meta.env.BASE_URL + "assets/data/productos.json";
export const URL_NOVEDADES = import.meta.env.BASE_URL + "assets/data/novedades.json";

const RUTA_IMAGEN = /^assets\/img\/[\w.-]+\.(jpe?g|png|webp)$/i;

export const ESQUEMA_PRODUCTO = {
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

export const ESQUEMA_NOVEDAD = {
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
export class ErrorDatos extends Error {
    constructor(mensaje, detalles = []) {
        super(mensaje);
        this.name = "ErrorDatos";
        this.detalles = detalles;
    }
}

function validarObjeto(objeto, esquema) {
    if (objeto === null || typeof objeto !== "object" || Array.isArray(objeto)) {
        return ["no es un objeto"];
    }

    const problemas = [];
    Object.entries(esquema).forEach(([campo, regla]) => {
        const valor = objeto[campo];

        if (valor === undefined) {
            problemas.push(`falta la propiedad "${campo}"`);
        } else if (typeof valor !== regla.tipo || (regla.tipo === "number" && !Number.isFinite(valor))) {
            problemas.push(`"${campo}" debe ser de tipo ${regla.tipo}`);
        } else if (regla.tipo === "string" && valor.trim() === "") {
            problemas.push(`"${campo}" no puede estar vacío`);
        } else if (regla.entero && !Number.isInteger(valor)) {
            problemas.push(`"${campo}" debe ser un entero`);
        } else if (regla.min !== undefined && valor < regla.min) {
            problemas.push(`"${campo}" debe ser mayor o igual a ${regla.min}`);
        } else if (regla.maxCampo && valor > objeto[regla.maxCampo]) {
            problemas.push(`"${campo}" no puede superar a "${regla.maxCampo}"`);
        } else if (regla.patron && !regla.patron.test(valor)) {
            problemas.push(`"${campo}" no tiene el formato esperado`);
        }
    });
    return problemas;
}

function validarLista(datos, esquema, nombre) {
    if (!Array.isArray(datos)) {
        throw new ErrorDatos(`${nombre}: se esperaba una lista`, ["la raíz del JSON no es un arreglo"]);
    }

    const detalles = [];
    const ids = new Set();
    datos.forEach((elemento, indice) => {
        validarObjeto(elemento, esquema).forEach((problema) => detalles.push(`[${indice}] ${problema}`));
        if (elemento && ids.has(elemento.id)) detalles.push(`[${indice}] id duplicado: ${elemento.id}`);
        if (elemento) ids.add(elemento.id);
    });

    if (detalles.length > 0) {
        throw new ErrorDatos(`${nombre}: estructura inválida`, detalles);
    }
    return datos;
}

/** Pide un JSON con fetch y lo valida. Rechaza con ErrorDatos ante fallos de red, HTTP, JSON o esquema. */
export async function cargarJSON(url, esquema, nombre) {
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        throw new ErrorDatos(`${nombre}: el servidor respondió ${respuesta.status}`);
    }
    return validarLista(await respuesta.json(), esquema, nombre);
}

/** Registra el error técnico en consola, separado del mensaje al usuario. */
export function registrarError(contexto, error) {
    console.error(`[GAME_CENTER] ${contexto}:`, error);
    if (error && error.detalles && error.detalles.length > 0) {
        console.error("Detalle de validación:\n - " + error.detalles.join("\n - "));
    }
}

/** Mensaje comprensible según el tipo de fallo (el detalle técnico va a consola). */
export function mensajeDeError(error) {
    if (error instanceof ErrorDatos && error.detalles.length > 0) {
        return "La información recibida no tiene el formato esperado. Puedes reintentar o avisarnos para corregirlo.";
    }
    return "No hay conexión con el catálogo en este momento. Revisa tu conexión y reintenta, o escríbenos si el problema continúa.";
}
