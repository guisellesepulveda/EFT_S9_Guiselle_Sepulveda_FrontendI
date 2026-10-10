import { useState } from "react";

const IMAGENES = [
    { ruta: "assets/img/PS5.webp", texto: "Consola PS5" },
    { ruta: "assets/img/controlPS5.jpeg", texto: "Control PS5" },
    { ruta: "assets/img/switch2.webp", texto: "Nintendo Switch 2" },
    { ruta: "assets/img/Metroid.webp", texto: "Metroid" }
];
const CATEGORIAS = ["Juegos", "Consolas", "Accesorios"];
const VACIO = { nombre: "", categoria: "Juegos", precio: "", descripcion: "", imagen: IMAGENES[0].ruta };

/** Revisa los datos y devuelve { campo: textoDeError } (vacío si todo es válido). */
function validarJuego({ nombre, precio, descripcion }) {
    const errores = {};
    if (nombre.length < 3) errores.nombre = "Escribe el nombre (mínimo 3 caracteres).";
    if (precio === "" || !Number.isInteger(Number(precio)) || Number(precio) <= 0) {
        errores.precio = "El precio debe ser un número entero mayor a 0.";
    }
    if (descripcion.length < 10) errores.descripcion = "Describe el juego (mínimo 10 caracteres).";
    return errores;
}

/** Formulario para agregar un videojuego; entrega el juego nuevo al padre mediante onAgregar. */
export default function FormAgregarJuego({ onAgregar }) {
    const [valores, setValores] = useState(VACIO);
    const [errores, setErrores] = useState({});

    function cambiar(evento) {
        setValores({ ...valores, [evento.target.name]: evento.target.value });
    }

    function enviar(evento) {
        evento.preventDefault();

        const limpios = { ...valores, nombre: valores.nombre.trim(), descripcion: valores.descripcion.trim() };
        const encontrados = validarJuego(limpios);
        setErrores(encontrados);
        if (Object.keys(encontrados).length > 0) return;

        const precio = Number(limpios.precio);
        onAgregar({
            nombre: limpios.nombre,
            titulo: limpios.nombre,
            categoria: limpios.categoria,
            plataforma: limpios.categoria,
            precio,
            precioOferta: precio,
            imagen: limpios.imagen,
            alt: limpios.nombre,
            resumen: limpios.descripcion,
            descripcion: limpios.descripcion
        });
        setValores(VACIO);
    }

    function campo(nombre) {
        return {
            id: "juego-" + nombre,
            name: nombre,
            value: valores[nombre],
            onChange: cambiar,
            className: "form-control" + (errores[nombre] ? " is-invalid" : "")
        };
    }

    return (
        <section id="agregar-juego" className="mt-5" aria-labelledby="titulo-agregar">
            <h3 id="titulo-agregar" className="text-center fw-bold mb-3 fs-4">Agregar un videojuego</h3>

            <form className="card card-body shadow-sm border-0 mx-auto" style={{ maxWidth: "40rem" }} noValidate onSubmit={enviar}>
                <div className="row g-3">
                    <div className="col-12 col-md-6">
                        <label htmlFor="juego-nombre" className="form-label fw-bold">Nombre</label>
                        <input type="text" placeholder="Ej: Zelda" {...campo("nombre")} />
                        <div className="invalid-feedback">{errores.nombre}</div>
                    </div>
                    <div className="col-6 col-md-3">
                        <label htmlFor="juego-categoria" className="form-label fw-bold">Categoría</label>
                        <select {...campo("categoria")} className="form-select">
                            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="col-6 col-md-3">
                        <label htmlFor="juego-precio" className="form-label fw-bold">Precio (CLP)</label>
                        <input type="number" min="1" placeholder="49990" {...campo("precio")} />
                        <div className="invalid-feedback">{errores.precio}</div>
                    </div>
                    <div className="col-12">
                        <label htmlFor="juego-imagen" className="form-label fw-bold">Imagen</label>
                        <select {...campo("imagen")} className="form-select">
                            {IMAGENES.map((i) => <option key={i.ruta} value={i.ruta}>{i.texto}</option>)}
                        </select>
                    </div>
                    <div className="col-12">
                        <label htmlFor="juego-descripcion" className="form-label fw-bold">Descripción</label>
                        <textarea rows="3" placeholder="Cuenta de qué trata el juego" {...campo("descripcion")} />
                        <div className="invalid-feedback">{errores.descripcion}</div>
                    </div>
                    <div className="col-12">
                        <button type="submit" className="btn btn-dark w-100">Agregar al catálogo</button>
                    </div>
                </div>
            </form>
        </section>
    );
}
