import { useState } from "react";
import { useCarrito } from "../context/CarritoContext";
import { useMensajes } from "../context/MensajesContext";
import { formatearPrecio, rutaPublica } from "../utils/formato";

/** Tarjeta de una novedad del catálogo (precio único, con control de stock). */
export default function TarjetaNovedad({ producto }) {
    const [resaltada, setResaltada] = useState(false);
    const { agregar, eliminar, cantidadEnCarrito } = useCarrito();
    const enCarrito = cantidadEnCarrito(producto.id) > 0;
    const { mostrarMensaje } = useMensajes();
    const agotado = producto.stock === 0;

    /** Botón alternable: si la novedad ya está en el carrito, un nuevo clic la quita. */
    function alternarCarrito() {
        if (enCarrito) {
            eliminar(producto.id);
            mostrarMensaje(producto.titulo + " se quitó del carrito.", "info");
            return;
        }
        agregar({ id: producto.id, nombre: producto.titulo, precio: producto.precio });
        mostrarMensaje(producto.titulo + " se agregó al carrito.", "exito");
    }

    return (
        <div className="col-12 col-sm-6 col-lg-4">
            <article
                className={"card h-100 shadow-sm border-0 card-novedad" + (resaltada ? " card-resaltada" : "")}
                onMouseEnter={() => setResaltada(true)}
                onMouseLeave={() => setResaltada(false)}
            >
                <img src={rutaPublica(producto.imagen)} className="card-img-top p-3" alt={producto.titulo} />
                <div className="card-body d-flex flex-column">
                    <span className="etiqueta-categoria">{producto.categoria}</span>
                    <h3 className="card-title fs-6 fw-bold mt-2">{producto.titulo}</h3>
                    <p className="text-warning fw-bold fs-5 mb-1">{formatearPrecio(producto.precio)}</p>
                    <p className="small text-muted flex-grow-1">{producto.descripcion}</p>
                    <p className="small mb-2">Plataforma: <strong>{producto.plataforma}</strong></p>
                    <button
                        type="button"
                        className={"btn w-100 mt-auto btn-agregar-novedad " + (enCarrito ? "btn-success" : "btn-dark")}
                        disabled={agotado}
                        aria-pressed={enCarrito}
                        title={enCarrito ? "Clic para quitar del carrito" : undefined}
                        onClick={alternarCarrito}
                    >
                        {agotado ? "Sin stock" : enCarrito ? "✓ En el carrito" : "Agregar al carrito"}
                    </button>
                </div>
            </article>
        </div>
    );
}
