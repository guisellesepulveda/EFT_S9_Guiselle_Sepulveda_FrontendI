import { useCallback, useEffect, useState } from "react";
import { cargarJSON, registrarError } from "../utils/datos";

/**
 * Carga y valida un JSON. Devuelve { datos, cargando, error, reintentar }.
 * Cambiar el número de intento vuelve a lanzar la petición.
 */
export default function useDatos(url, esquema, nombre) {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState(null);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        let vigente = true;
        setDatos(null);
        setError(null);

        cargarJSON(url, esquema, nombre)
            .then((lista) => vigente && setDatos(lista))
            .catch((err) => {
                registrarError(`No se pudo cargar ${nombre}`, err);
                if (vigente) setError(err);
            });

        return () => {
            vigente = false;
        };
    }, [url, esquema, nombre, intento]);

    const reintentar = useCallback(() => setIntento((n) => n + 1), []);

    return { datos, cargando: datos === null && error === null, error, reintentar };
}
