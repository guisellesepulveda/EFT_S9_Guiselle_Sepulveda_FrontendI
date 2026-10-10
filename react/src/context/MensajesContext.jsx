import { createContext, useCallback, useContext, useRef, useState } from "react";

const MensajesContext = createContext(null);

export function MensajesProvider({ children }) {
    const [mensajes, setMensajes] = useState([]);
    const siguienteId = useRef(0);

    /** Muestra un mensaje flotante 3 segundos. tipo: "exito" | "error" | "info" */
    const mostrarMensaje = useCallback((texto, tipo = "info") => {
        const id = siguienteId.current++;
        setMensajes((actuales) => [...actuales, { id, texto, tipo }]);
        setTimeout(() => {
            setMensajes((actuales) => actuales.filter((m) => m.id !== id));
        }, 3000);
    }, []);

    return (
        <MensajesContext.Provider value={{ mensajes, mostrarMensaje }}>
            {children}
        </MensajesContext.Provider>
    );
}

export function useMensajes() {
    return useContext(MensajesContext);
}
