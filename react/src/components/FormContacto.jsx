import { useState } from "react";
import { useMensajes } from "../context/MensajesContext";

const VACIO = { nombre: "", correo: "", mensaje: "" };
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Revisa los datos y devuelve un objeto { campo: textoDeError } (vacío si todo es válido). */
function validarContacto({ nombre, correo, mensaje }) {
    const errores = {};
    if (nombre.length < 3) errores.nombre = "Escribe tu nombre (mínimo 3 caracteres).";
    if (!FORMATO_CORREO.test(correo)) errores.correo = "El correo no tiene un formato válido.";
    if (mensaje.length < 10) errores.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
    return errores;
}

export default function FormContacto() {
    const [valores, setValores] = useState(VACIO);
    const [errores, setErrores] = useState({});
    const [resumen, setResumen] = useState(null);
    const { mostrarMensaje } = useMensajes();

    function cambiar(evento) {
        setValores({ ...valores, [evento.target.name]: evento.target.value });
    }

    function enviar(evento) {
        evento.preventDefault(); // evita que la página se recargue

        const limpios = {
            nombre: valores.nombre.trim(),
            correo: valores.correo.trim(),
            mensaje: valores.mensaje.trim()
        };
        const encontrados = validarContacto(limpios);
        setErrores(encontrados);

        if (Object.keys(encontrados).length > 0) {
            mostrarMensaje("Revisa los datos del formulario.", "error");
            return;
        }

        setResumen({ nombre: limpios.nombre, correo: limpios.correo });
        setValores(VACIO);
        mostrarMensaje("¡Mensaje enviado! Te responderemos pronto.", "exito");
    }

    function campo(nombre) {
        return {
            id: nombre,
            name: nombre,
            value: valores[nombre],
            onChange: cambiar,
            className: errores[nombre] ? "campo-invalido" : undefined
        };
    }

    return (
        <section id="contacto" className="mt-5">
            <h2 className="text-center fw-bold mb-4">Escríbenos</h2>

            <form id="form-contacto" className="formulario-contacto" noValidate onSubmit={enviar}>
                <div>
                    <label htmlFor="nombre">Nombre</label>
                    <input type="text" placeholder="Tu nombre" {...campo("nombre")} />
                    <div className="zona-error">{errores.nombre && <p className="texto-error">{errores.nombre}</p>}</div>
                </div>
                <div>
                    <label htmlFor="correo">Correo electrónico</label>
                    <input type="email" placeholder="ejemplo@correo.cl" {...campo("correo")} />
                    <div className="zona-error">{errores.correo && <p className="texto-error">{errores.correo}</p>}</div>
                </div>
                <div>
                    <label htmlFor="mensaje">Mensaje</label>
                    <textarea rows="4" placeholder="¿En qué podemos ayudarte?" {...campo("mensaje")} />
                    <div className="zona-error">{errores.mensaje && <p className="texto-error">{errores.mensaje}</p>}</div>
                </div>
                <button type="submit" className="btn btn-dark w-100">Enviar consulta</button>
            </form>

            <div id="resultado-contacto">
                {resumen && (
                    <div className="resumen-contacto">
                        <h3>Gracias, {resumen.nombre}</h3>
                        <p>Hemos registrado tu consulta y responderemos a <strong>{resumen.correo}</strong>.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
