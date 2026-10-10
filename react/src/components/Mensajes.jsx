import { useMensajes } from "../context/MensajesContext";

/** Contenedor de los mensajes flotantes (toasts). */
export default function Mensajes() {
    const { mensajes } = useMensajes();

    return (
        <div id="contenedor-mensajes">
            {mensajes.map((m) => (
                <div key={m.id} className={`mensaje-flotante mensaje-${m.tipo}`} role="status">{m.texto}</div>
            ))}
        </div>
    );
}
