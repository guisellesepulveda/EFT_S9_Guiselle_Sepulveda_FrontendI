import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AvisoError from "../components/AvisoError";
import { useCarrito } from "../context/CarritoContext";
import { useMensajes } from "../context/MensajesContext";
import useDatos from "../hooks/useDatos";
import { ESQUEMA_NOVEDAD, ESQUEMA_PRODUCTO, URL_NOVEDADES, URL_PRODUCTOS } from "../utils/datos";
import { formatearPrecio, rutaPublica } from "../utils/formato";

const CANTIDAD_MAX = 10;

export default function Detalle() {
    const { id } = useParams();
    const { mostrarMensaje } = useMensajes();
    const { datos, cargando, error, reintentar } = useDatos(URL_PRODUCTOS, ESQUEMA_PRODUCTO, "productos.json");

    const producto = datos ? datos.find((p) => String(p.id) === id) : null;
    const noEncontrado = datos !== null && !producto;

    useEffect(() => {
        if (producto) document.title = producto.titulo + " - GAME_CENTER";
    }, [producto]);

    useEffect(() => {
        if (error) mostrarMensaje("No pudimos cargar el producto.", "error");
        if (noEncontrado) mostrarMensaje("No encontramos el producto que buscas.", "error");
    }, [error, noEncontrado, mostrarMensaje]);

    return (
        <>
            <header id="top" className="bg-primary text-white text-center py-4">
                <h1 className="display-6 fw-bold">GAME_CENTER</h1>
            </header>
            <main>
                <div id="zona-detalle">
                    {cargando && <p className="cargando">Cargando producto...</p>}
                    {error && (
                        <AvisoError
                            titulo="No pudimos cargar el producto"
                            mensaje="Reintenta la carga o escríbenos si el problema continúa."
                            reintentar={reintentar}
                        />
                    )}
                    {noEncontrado && (
                        <div className="aviso-error">
                            <p>No encontramos el producto que buscas.</p>
                            <Link to="/#productos" className="btn btn-dark btn-sm">Volver a los productos</Link>
                        </div>
                    )}
                    {/* key: al cambiar de producto el formulario vuelve a empezar */}
                    {producto && <DetalleProducto key={producto.id} producto={producto} />}
                </div>

                <Relacionados />
            </main>
        </>
    );
}

/** Detalle completo: imagen con zoom, precios, descripción y formulario de compra. */
function DetalleProducto({ producto }) {
    const { agregar, cantidadEnCarrito } = useCarrito();
    const enCarrito = cantidadEnCarrito(producto.id);
    const { mostrarMensaje } = useMensajes();
    const [cantidad, setCantidad] = useState("1");
    const [invalida, setInvalida] = useState(false);
    const [zoom, setZoom] = useState(false);

    const numero = Number(cantidad);
    const cantidadValida = Number.isInteger(numero) && numero >= 1 ? numero : 1;

    function cambiarCantidad(paso) {
        setCantidad((actual) => {
            const n = Number(actual);
            const base = Number.isInteger(n) && n >= 1 ? n : 1;
            return String(Math.min(CANTIDAD_MAX, Math.max(1, base + paso)));
        });
        setInvalida(false);
    }

    function enviar(evento) {
        evento.preventDefault();

        if (!Number.isInteger(numero) || numero < 1 || numero > CANTIDAD_MAX) {
            setInvalida(true);
            mostrarMensaje("Ingresa una cantidad entre 1 y 10 unidades.", "error");
            return;
        }

        setInvalida(false);
        agregar({ id: producto.id, nombre: producto.nombre, precio: producto.precioOferta }, numero);
        mostrarMensaje(`${numero} x ${producto.nombre} agregado al carrito.`, "exito");
    }

    return (
        <section className="detalle-producto-container">
            <div className="detalle-imagen">
                <img
                    src={rutaPublica(producto.imagen)}
                    alt={producto.alt}
                    className={zoom ? "imagen-zoom" : undefined}
                    onMouseEnter={() => setZoom(true)}
                    onMouseLeave={() => setZoom(false)}
                />
            </div>
            <div className="detalle-info">
                <h2>{producto.titulo}</h2>
                <p className="bloque-precios">
                    <del className="precio-normal" aria-label="Precio normal">{formatearPrecio(producto.precio)}</del>
                    <span className="precio-detalle" aria-label="Precio oferta">{formatearPrecio(producto.precioOferta)}</span>
                </p>
                <p className="descripcion-larga">{producto.descripcion}</p>

                <form className="compra-acciones" id="form-compra" noValidate onSubmit={enviar}>
                    <label htmlFor="cantidad">Cantidad:</label>
                    <button type="button" className="btn-cantidad" aria-label="Disminuir cantidad" onClick={() => cambiarCantidad(-1)}>−</button>
                    <input
                        type="number"
                        id="cantidad"
                        name="cantidad"
                        min="1"
                        max={CANTIDAD_MAX}
                        value={cantidad}
                        className={invalida ? "campo-invalido" : undefined}
                        onChange={(e) => setCantidad(e.target.value)}
                    />
                    <button type="button" className="btn-cantidad" aria-label="Aumentar cantidad" onClick={() => cambiarCantidad(1)}>+</button>
                    <button type="submit" className={"btn-agregar" + (enCarrito > 0 ? " btn-agregar-en-carrito" : "")}>
                        {enCarrito > 0 ? `En el carrito (${enCarrito}) · agregar más` : "Agregar al carrito"}
                    </button>
                </form>

                <p className="subtotal">Subtotal: {formatearPrecio(producto.precioOferta * cantidadValida)}</p>
            </div>
        </section>
    );
}

/** "También te puede interesar": hasta 3 productos del catálogo de novedades. */
function Relacionados() {
    const { datos, cargando, error, reintentar } = useDatos(URL_NOVEDADES, ESQUEMA_NOVEDAD, "novedades.json");

    return (
        <section className="relacionados" id="zona-relacionados">
            <h2>También te puede interesar</h2>
            {cargando && <p className="cargando">Cargando sugerencias...</p>}
            {error && (
                <AvisoError
                    titulo="No pudimos cargar las sugerencias"
                    mensaje="Puedes reintentar o escribirnos si el problema continúa."
                    reintentar={reintentar}
                />
            )}
            {datos && (
                <div className="lista-relacionados">
                    {datos.slice(0, 3).map((n) => (
                        <article className="tarjeta-relacionada" key={n.id}>
                            <img src={rutaPublica(n.imagen)} alt={n.titulo} />
                            <h3>{n.titulo}</h3>
                            <p className="precio">{formatearPrecio(n.precio)}</p>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
