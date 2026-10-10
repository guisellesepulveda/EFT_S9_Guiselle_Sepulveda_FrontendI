import TarjetaProducto from "./TarjetaProducto";

/** Lista de videojuegos: recibe el arreglo ya filtrado y lo dibuja como tarjetas. */
export default function ListaJuegos({ juegos, onEliminar }) {
    if (juegos.length === 0) {
        return <p className="aviso-vacio">No encontramos productos con ese criterio.</p>;
    }

    return (
        <div className="row g-4">
            {juegos.map((juego) => (
                <TarjetaProducto key={juego.id} producto={juego} onEliminar={onEliminar} />
            ))}
        </div>
    );
}
