import { CORREO_CONTACTO } from "../utils/datos";

/** Aviso de error con acciones: reintentar y contactar por correo. */
export default function AvisoError({ titulo, mensaje, reintentar }) {
    const asunto = encodeURIComponent("Problema en el sitio: " + titulo);

    return (
        <div className="aviso-error" role="alert">
            <p><strong>{titulo}</strong></p>
            <p className="small mb-2">{mensaje}</p>
            <div className="acciones-error">
                {reintentar && (
                    <button type="button" className="btn btn-dark btn-sm" onClick={reintentar}>Reintentar</button>
                )}
                <a className="btn btn-outline-dark btn-sm" href={`mailto:${CORREO_CONTACTO}?subject=${asunto}`}>
                    Contactar a soporte
                </a>
            </div>
        </div>
    );
}
