/** Convierte un número a formato de precio chileno. Ej: 64990 -> "$64.990" */
export function formatearPrecio(valor) {
    return "$" + Number(valor).toLocaleString("es-CL");
}

/** Las rutas de los JSON son relativas (assets/img/...); se les antepone la base del sitio (/ o /NOMBRE-REPO/). */
export function rutaPublica(ruta) {
    return import.meta.env.BASE_URL + ruta;
}
