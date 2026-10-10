import { Link, useLocation } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

const CATEGORIAS = ["Consolas", "Juegos", "Accesorios"];

/** Barra de navegación (Bootstrap). Los enlaces cambian según la ruta. */
export default function Navbar() {
    const { pathname } = useLocation();
    const { totalUnidades, alternarPanel } = useCarrito();
    const esInicio = pathname === "/";

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top" aria-label="Menú principal">
            <div className="container">
                {esInicio
                    ? <a className="navbar-brand fw-bold" href="#top">GAME_CENTER</a>
                    : <Link className="navbar-brand fw-bold" to="/">GAME_CENTER</Link>}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Abrir menú de navegación"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {esInicio ? <EnlacesInicio /> : <EnlacesDetalle />}
                        <li className="nav-item">
                            <button
                                id="btn-carrito"
                                type="button"
                                className="btn btn-warning btn-sm ms-lg-3 mt-2 mt-lg-0"
                                onClick={alternarPanel}
                            >
                                Carrito <span id="contador-carrito" className="badge bg-dark">{totalUnidades}</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

function EnlacesInicio() {
    return (
        <>
            <li className="nav-item"><a className="nav-link active" aria-current="page" href="#top">Inicio</a></li>
            <li className="nav-item"><a className="nav-link" href="#carrusel">Destacados</a></li>
            <li className="nav-item"><a className="nav-link" href="#productos">Productos</a></li>
            <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#productos" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Categorías
                </a>
                <ul className="dropdown-menu">
                    {CATEGORIAS.map((categoria) => (
                        <li key={categoria}>
                            <Link className="dropdown-item" to={`/?categoria=${categoria}#productos`}>{categoria}</Link>
                        </li>
                    ))}
                </ul>
            </li>
            <li className="nav-item"><a className="nav-link" href="#novedades">Novedades</a></li>
            <li className="nav-item"><a className="nav-link" href="#contacto">Contacto</a></li>
        </>
    );
}

function EnlacesDetalle() {
    return (
        <>
            <li className="nav-item"><Link className="nav-link" to="/">Inicio</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/#productos">Productos</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/#contacto">Contacto</Link></li>
        </>
    );
}
