import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Mensajes from "./components/Mensajes";
import Navbar from "./components/Navbar";
import PanelCarrito from "./components/PanelCarrito";
import Detalle from "./pages/Detalle";
import Home from "./pages/Home";

/** Al navegar entre rutas: baja a la ancla (#seccion) o vuelve arriba. */
function ScrollAlNavegar() {
    const { pathname, hash, key } = useLocation();

    useEffect(() => {
        const destino = hash && document.getElementById(hash.slice(1));
        if (destino) destino.scrollIntoView();
        else window.scrollTo(0, 0);
    }, [pathname, hash, key]);

    return null;
}

export default function App() {
    return (
        <>
            <ScrollAlNavegar />
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/detalle/:id" element={<Detalle />} />
                <Route path="*" element={<Home />} />
            </Routes>
            <Footer />
            <PanelCarrito />
            <Mensajes />
        </>
    );
}
