import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap"; // JS de Bootstrap: navbar colapsable, dropdown y carrusel
import "./styles/game.css";
import App from "./App";
import { CarritoProvider } from "./context/CarritoContext";
import { MensajesProvider } from "./context/MensajesContext";

createRoot(document.getElementById("root")).render(
    <BrowserRouter basename={import.meta.env.BASE_URL}>
        <MensajesProvider>
            <CarritoProvider>
                <App />
            </CarritoProvider>
        </MensajesProvider>
    </BrowserRouter>
);
