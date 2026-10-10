import { useCarrito } from "../context/CarritoContext";
import { useMensajes } from "../context/MensajesContext";
import { formatearPrecio } from "../utils/formato";

/** Panel lateral del carrito: lista, contador, total y acciones. */
export default function PanelCarrito() {
    const { items, eliminar, cambiarCantidad, vaciar, totalUnidades, totalPrecio, panelAbierto, cerrarPanel } = useCarrito();
    const { mostrarMensaje } = useMensajes();

    function manejarVaciar() {
        if (items.length === 0) {
            mostrarMensaje("El carrito ya está vacío.", "info");
            return;
        }
        vaciar();
        mostrarMensaje("Carrito vaciado.", "info");
    }

    function manejarEliminar(id) {
        eliminar(id);
        mostrarMensaje("Producto eliminado del carrito.", "info");
    }

    return (
        <aside id="panel-carrito" className={panelAbierto ? "panel-abierto" : ""} aria-label="Carrito de compras">
            <div className="panel-cabecera">
                <h2>Tu carrito</h2>
                <button type="button" id="cerrar-carrito" aria-label="Cerrar carrito" onClick={cerrarPanel}>&times;</button>
            </div>

            <div id="lista-carrito">
                {items.length === 0 ? (
                    <div className="carrito-vacio">
                        <p className="mb-2">🛒 Tu carrito está vacío.</p>
                        <p className="small text-muted mb-0">Agrega productos desde el catálogo para verlos aquí.</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div className="item-carrito" key={item.id}>
                            <div>
                                <strong className="d-block">{item.nombre}</strong>
                                <span className="small text-muted">{formatearPrecio(item.precio)} c/u</span>
                                <div className="control-cantidad">
                                    <button
                                        type="button"
                                        aria-label={"Disminuir cantidad de " + item.nombre}
                                        disabled={item.cantidad <= 1}
                                        onClick={() => cambiarCantidad(item.id, -1)}
                                    >
                                        −
                                    </button>
                                    <span aria-live="polite">{item.cantidad}</span>
                                    <button type="button" aria-label={"Aumentar cantidad de " + item.nombre} onClick={() => cambiarCantidad(item.id, 1)}>
                                        +
                                    </button>
                                </div>
                            </div>
                            <button
                                className="btn-quitar"
                                aria-label={"Quitar " + item.nombre}
                                onClick={() => manejarEliminar(item.id)}
                            >
                                ×
                            </button>
                        </div>
                    ))
                )}
            </div>

            <p className="small mb-1">Productos en el carrito: <strong id="unidades-carrito">{totalUnidades}</strong></p>
            <p className="panel-total">Total: <span id="total-carrito">{formatearPrecio(totalPrecio)}</span></p>
            {items.length > 0 && (
                <button type="button" id="vaciar-carrito" className="btn btn-outline-light btn-sm w-100" onClick={manejarVaciar}>
                    Vaciar carrito
                </button>
            )}
        </aside>
    );
}
