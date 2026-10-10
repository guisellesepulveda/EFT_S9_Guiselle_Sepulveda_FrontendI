export default function Footer() {
    return (
        <footer className="bg-dark text-white text-center py-4 mt-5">
            <div className="container">
                <p className="mb-1">© 2026 GAME_CENTER. Todos los derechos reservados.</p>
                <p className="mb-1 text-secondary">
                    Contacto: game_center@gmail.com | Dirección: Vicuña Mackenna 3035, La Florida
                </p>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-warning text-decoration-none">
                    Síguenos en redes sociales
                </a>
                <div className="mt-3">
                    <a href="#top" className="btn btn-outline-light btn-sm">Volver arriba</a>
                </div>
            </div>
        </footer>
    );
}
