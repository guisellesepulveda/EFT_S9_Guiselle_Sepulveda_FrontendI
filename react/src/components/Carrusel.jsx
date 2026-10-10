import { useEffect, useRef } from "react";
import { Carousel } from "bootstrap";
import { formatearPrecio, rutaPublica } from "../utils/formato";

/** Carrusel Bootstrap con un slide por producto (autoplay cada 3 segundos). */
export default function Carrusel({ productos }) {
    const ref = useRef(null);

    // Los slides se crean con React, así que la instancia de Bootstrap se arranca aquí.
    useEffect(() => {
        const instancia = new Carousel(ref.current, { interval: 3000, ride: "carousel" });
        return () => instancia.dispose();
    }, []);

    return (
        <section id="carrusel" className="mb-5">
            <div id="gameCarousel" ref={ref} className="carousel slide shadow rounded overflow-hidden">
                <div className="carousel-indicators">
                    {productos.map((p, i) => (
                        <button
                            key={p.id}
                            type="button"
                            data-bs-target="#gameCarousel"
                            data-bs-slide-to={i}
                            className={i === 0 ? "active" : undefined}
                            aria-current={i === 0 ? "true" : undefined}
                            aria-label={"Slide " + (i + 1)}
                        />
                    ))}
                </div>
                <div className="carousel-inner bg-dark">
                    {productos.map((p, i) => (
                        <div key={p.id} className={"carousel-item" + (i === 0 ? " active" : "")}>
                            <img src={rutaPublica(p.imagen)} className="d-block w-100 object-fit-contain carrusel-img" alt={p.alt} />
                            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-75 rounded p-2">
                                <h5>{p.nombre}</h5>
                                <p className="mb-0 text-warning fw-bold">
                                    <del className="precio-normal me-2">{formatearPrecio(p.precio)}</del>
                                    {formatearPrecio(p.precioOferta)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#gameCarousel" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon bg-dark rounded-circle p-3 shadow" aria-hidden="true"></span>
                    <span className="visually-hidden">Anterior</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#gameCarousel" data-bs-slide="next">
                    <span className="carousel-control-next-icon bg-dark rounded-circle p-3 shadow" aria-hidden="true"></span>
                    <span className="visually-hidden">Siguiente</span>
                </button>
            </div>
        </section>
    );
}
