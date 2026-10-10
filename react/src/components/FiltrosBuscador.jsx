/** Barra de filtros por categoría y buscador por nombre (componente controlado por Home). */
export default function FiltrosBuscador({ categorias, categoria, busqueda, onCategoria, onBusqueda, onBuscar }) {
    function enviar(evento) {
        evento.preventDefault(); // evita que la página se recargue
        onBuscar();
    }

    return (
        <div className="barra-filtros">
            <div className="grupo-filtros">
                {categorias.map((c) => (
                    <button
                        key={c}
                        type="button"
                        className={"btn-filtro" + (c === categoria ? " activo" : "")}
                        onClick={() => onCategoria(c)}
                    >
                        {c}
                    </button>
                ))}
            </div>
            <form className="form-buscador" role="search" onSubmit={enviar}>
                <input
                    type="search"
                    id="buscador"
                    name="busqueda"
                    className="campo-buscador"
                    placeholder="Buscar producto..."
                    aria-label="Buscar producto"
                    value={busqueda}
                    onChange={(e) => onBusqueda(e.target.value)}
                />
                <button type="submit" className="btn btn-dark btn-sm rounded-pill px-3">Buscar</button>
            </form>
        </div>
    );
}
