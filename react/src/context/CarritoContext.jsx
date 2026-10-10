import { createContext, useContext, useEffect, useState } from "react";

const CLAVE = "gamecenter_carrito";
const CarritoContext = createContext(null);

/** Lee el carrito guardado; los ids se normalizan a número. Si hay datos corruptos devuelve []. */
function leerCarrito() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE));
        if (!Array.isArray(guardado)) return [];
        return guardado.map((item) => ({ ...item, id: Number(item.id) }));
    } catch (error) {
        console.warn("No se pudo leer el carrito guardado:", error);
        return [];
    }
}

export function CarritoProvider({ children }) {
    const [items, setItems] = useState(leerCarrito);
    const [panelAbierto, setPanelAbierto] = useState(false);

    // Persistencia: cada cambio del carrito se guarda en localStorage.
    useEffect(() => {
        try {
            localStorage.setItem(CLAVE, JSON.stringify(items));
        } catch (error) {
            console.warn("No se pudo guardar el carrito:", error);
        }
    }, [items]);

    /** Agrega un producto ({id, nombre, precio}); si ya existe, suma la cantidad. */
    function agregar(producto, cantidad = 1) {
        const id = Number(producto.id);
        setItems((actual) => {
            if (actual.some((item) => item.id === id)) {
                return actual.map((item) => (item.id === id ? { ...item, cantidad: item.cantidad + cantidad } : item));
            }
            return [...actual, { id, nombre: producto.nombre, precio: producto.precio, cantidad }];
        });
    }

    /** Elimina por completo un producto del carrito. */
    function eliminar(id) {
        setItems((actual) => actual.filter((item) => item.id !== Number(id)));
    }

    /** Suma o resta unidades de un producto (mínimo 1; para quitarlo se usa eliminar). */
    function cambiarCantidad(id, paso) {
        setItems((actual) =>
            actual.map((item) =>
                item.id === Number(id) ? { ...item, cantidad: Math.max(1, item.cantidad + paso) } : item
            )
        );
    }

    /** Unidades de un producto en el carrito (0 si no está). Sirve para el renderizado condicional. */
    function cantidadEnCarrito(id) {
        const item = items.find((i) => i.id === Number(id));
        return item ? item.cantidad : 0;
    }

    function vaciar() {
        setItems([]);
    }

    const totalUnidades = items.reduce((suma, item) => suma + item.cantidad, 0);
    const totalPrecio = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

    const valor = {
        items,
        agregar,
        eliminar,
        cambiarCantidad,
        cantidadEnCarrito,
        vaciar,
        totalUnidades,
        totalPrecio,
        panelAbierto,
        alternarPanel: () => setPanelAbierto((abierto) => !abierto),
        cerrarPanel: () => setPanelAbierto(false)
    };

    return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
    return useContext(CarritoContext);
}
