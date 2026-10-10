import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AvisoError from "../components/AvisoError";
import Carrusel from "../components/Carrusel";
import FiltrosBuscador from "../components/FiltrosBuscador";
import FormContacto from "../components/FormContacto";
import TarjetaNovedad from "../components/TarjetaNovedad";
import TarjetaProducto from "../components/TarjetaProducto";
import { useMensajes } from "../context/MensajesContext";
import useDatos from "../hooks/useDatos";
import { ESQUEMA_NOVEDAD, ESQUEMA_PRODUCTO, URL_NOVEDADES, URL_PRODUCTOS, mensajeDeError } from "../utils/datos";

export default function Home() {
    const { search, key } = useLocation();
    const { mostrarMensaje } = useMensajes();
    const productos = useDatos(URL_PRODUCTOS, ESQUEMA_PRODUCTO, "productos.json");
    const novedades = useDatos(URL_NOVEDADES, ESQUEMA_NOVEDAD, "novedades.json");

    const [categoria, setCategoria] = useState(() => new URLSearchParams(search).get("categoria") || "Todos");
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => { document.title = "GAME_CENTER - Tienda de Videojuegos"; }, []);

    // El menú "Categorías" de la navbar llega con ?categoria=...: aplica el filtro y limpia el buscador.
    useEffect(() => {
        const desdeMenu = new URLSearchParams(search).get("categoria");
        if (desdeMenu) {
            setCategoria(desdeMenu);
            setBusqueda("");
        }
    }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (productos.error) mostrarMensaje("No pudimos cargar los productos.", "error");
    }, [productos.error, mostrarMensaje]);

    useEffect(() => {
        if (novedades.error) mostrarMensaje("No pudimos cargar las novedades.", "error");
    }, [novedades.error, mostrarMensaje]);

    const categorias = productos.datos ? ["Todos", ...new Set(productos.datos.map((p) => p.categoria))] : [];

    const texto = busqueda.trim().toLowerCase();
    const visibles = (productos.datos || []).filter(
        (p) => (categoria === "Todos" || p.categoria === categoria) && p.nombre.toLowerCase().includes(texto)
    );

    function buscar() {
        const n = visibles.length;
        if (n === 0) mostrarMensaje("No encontramos productos con ese criterio.", "info");
        else mostrarMensaje(n + (n === 1 ? " producto encontrado." : " productos encontrados."), "exito");
    }

    function elegirCategoria(nueva) {
        setCategoria(nueva);
        setBusqueda("");
    }

    return (
        <>
            <header id="top" className="bg-primary text-white text-center py-5">
                <div className="container">
                    <h1 className="display-4 fw-bold">GAME_CENTER</h1>
                    <p className="lead">Tu destino definitivo para encontrar las últimas novedades, consolas y accesorios.</p>
                </div>
            </header>

            <main>
                {productos.datos && <Carrusel productos={productos.datos} />}

                <section id="productos">
                    <h2 className="text-center mb-4 fw-bold">Productos Destacados</h2>

                    {productos.datos && (
                        <FiltrosBuscador
                            categorias={categorias}
                            categoria={categoria}
                            busqueda={busqueda}
                            onCategoria={elegirCategoria}
                            onBusqueda={setBusqueda}
                            onBuscar={buscar}
                        />
                    )}

                    {productos.cargando && <p className="cargando">Cargando productos...</p>}
                    {productos.error && (
                        <AvisoError
                            titulo="No pudimos cargar los productos"
                            mensaje={mensajeDeError(productos.error)}
                            reintentar={productos.reintentar}
                        />
                    )}

                    <div className="row g-4">
                        {visibles.map((p) => <TarjetaProducto key={p.id} producto={p} />)}
                    </div>

                    {productos.datos && visibles.length === 0 && (
                        <p className="aviso-vacio">No encontramos productos con ese criterio.</p>
                    )}
                </section>

                <section id="novedades" className="mt-5">
                    <h2 className="text-center fw-bold mb-2">Novedades del catálogo</h2>
                    <p className="text-center text-muted mb-4">
                        Estos productos se cargan dinámicamente desde un archivo externo.
                    </p>

                    {novedades.cargando && <p className="cargando">Cargando novedades...</p>}
                    {novedades.error && (
                        <AvisoError
                            titulo="No pudimos cargar las novedades"
                            mensaje={mensajeDeError(novedades.error)}
                            reintentar={novedades.reintentar}
                        />
                    )}
                    {novedades.datos && novedades.datos.length === 0 && (
                        <p className="aviso-vacio">Por ahora no hay novedades disponibles.</p>
                    )}

                    <div className="row g-4">
                        {(novedades.datos || []).map((n) => <TarjetaNovedad key={n.id} producto={n} />)}
                    </div>
                </section>

                <FormContacto />
            </main>
        </>
    );
}
