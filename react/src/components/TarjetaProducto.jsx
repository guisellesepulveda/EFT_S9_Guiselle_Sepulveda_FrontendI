import { useState } from "react";
import { Link } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useMensajes } from "../context/MensajesContext";
import { formatearPrecio, rutaPublica } from "../utils/formato";

/** Tarjeta de un producto destacado: imagen, nombre, precio normal, precio oferta y resumen. */
export default function TarjetaProducto({ producto }) {
    const [resaltada, setResaltada] = useState(false);
    const { agregar, eliminar, cantidadEnCarrito } = useCarrito();
    const enCarrito = cantidadEnCarrito(producto.id) > 0;
    const { mostrarMensaje } = useMensajes();

    /** Botón alternable: si el producto ya está en el carrito, un nuevo clic lo quita. */
    function alternarCarrito() {
        if (enCarrito) {
            eliminar(producto.id);
            mostrarMensaje(producto.nombre + " se quitó del carrito.", "info");
            return;
        }
        agregar({ id: producto.id, nombre: producto.nombre, precio: producto.precioOferta });
        mostrarMensaje(producto.nombre + " se agregó al carrito.", "exito");
    }

    return (
        <div className="col-12 col-sm-6 col-lg-3">
            <div
                className={"card h-100 shadow-sm border-0" + (resaltada ? " card-resaltada" : "")}
                onMouseEnter={() => setResaltada(true)}
                onMouseLeave={() => setResaltada(false)}
            >
                <span className="zona-etiqueta">
                    {resaltada && <span className="etiqueta-plataforma">{producto.plataforma || producto.categoria}</span>}
                </span>
                <img src={rutaPublica(producto.imagen)} className="card-img-top p-3 card-producto-img" alt={producto.alt} />
                <div className="card-body d-flex flex-column">
                    <h3 className="card-title fs-6 fw-bold">{producto.nombre}</h3>
                    <p className="bloque-precios">
                        <del className="precio-normal" aria-label="Precio normal">{formatearPrecio(producto.precio)}</del>
                        <span className="text-warning fw-bold fs-5" aria-label="Precio oferta">{formatearPrecio(producto.precioOferta)}</span>
                    </p>
                    <p className="card-text small text-muted flex-grow-1">{producto.resumen}</p>
                    <Link to={`/detalle/${producto.id}`} className="btn btn-dark w-100 mt-auto">Ver detalle</Link>
                    <button
                        type="button"
                        className={"btn w-100 mt-2 btn-agregar-card " + (enCarrito ? "btn-success" : "btn-outline-dark")}
                        aria-pressed={enCarrito}
                        title={enCarrito ? "Clic para quitar del carrito" : undefined}
                        onClick={alternarCarrito}
                    >
                        {enCarrito ? "✓ En el carrito" : "Agregar al carrito"}
                    </button>
                </div>
            </div>
        </div>
    );
}
