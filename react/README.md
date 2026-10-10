# GAME_CENTER – Versión React

Tienda online de videojuegos hecha con **React 19**, **Vite**, **React Router** y **Bootstrap 5** (instalado por npm).
La versión sin React está en la raíz del repositorio ([README](../README.md)).

## Requisitos

- Node.js 22 o superior y npm.

## Instalación y uso

```bash
cd react
npm install        # instala las dependencias
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # genera la versión de producción en react/dist
npm run preview    # sirve localmente la carpeta dist
```

## Funcionalidades

- Navbar responsiva (Bootstrap) con menú de categorías y contador del carrito.
- Tarjetas de videojuegos con imagen, nombre, precio, descripción y botones de acción.
- **Filtro por categoría** y buscador por nombre.
- **Agregar videojuegos**: formulario "Agregar un videojuego" con validación (nombre, categoría, precio, imagen y descripción).
- **Eliminar videojuegos**: botón "Eliminar del catálogo" en cada tarjeta (pide confirmación y también lo quita del carrito).
- Carrito de compras persistente (`localStorage`).
- Formulario de contacto con validación y mensajes de error.
- Datos cargados desde archivos externos (`public/assets/data/*.json`) con `fetch`, validación de esquema, estado de carga y reintento ante errores.

> Los videojuegos agregados o eliminados viven en el **estado de React** (memoria): al recargar la página el catálogo vuelve al contenido de `productos.json`. Los juegos agregados no tienen página de detalle propia.

## Estructura de componentes

```
src/
  main.jsx                    Punto de entrada (Router + proveedores de contexto)
  App.jsx                     Navbar, rutas, Footer, carrito y mensajes
  pages/
    Home.jsx                  Dueño del estado: juegos, categoría y búsqueda
    Detalle.jsx               Detalle de un producto
  components/
    Navbar.jsx / Footer.jsx
    Carrusel.jsx
    FiltrosBuscador.jsx       Botones de categoría + buscador
    ListaJuegos.jsx           Lista de tarjetas
    TarjetaProducto.jsx       Una tarjeta de videojuego
    FormAgregarJuego.jsx      Alta de un videojuego
    FormContacto.jsx          Formulario de contacto
    PanelCarrito.jsx, Mensajes.jsx, AvisoError.jsx, TarjetaNovedad.jsx
  context/                    CarritoContext y MensajesContext
  hooks/useDatos.js           Carga y valida un JSON
  utils/                      datos.js (esquemas) y formato.js
  styles/game.css
```

## Flujo de state y props

`Home` guarda el estado (`juegos`, `categoria`, `busqueda`) y lo reparte por props:

- `FiltrosBuscador` recibe `categorias`, `categoria`, `busqueda` y las funciones `onCategoria`, `onBusqueda`, `onBuscar`. Al filtrar, `Home` actualiza su estado y recalcula `visibles`.
- `ListaJuegos` recibe `juegos` (ya filtrados) y `onEliminar`, y los pasa a cada `TarjetaProducto`.
- `FormAgregarJuego` recibe `onAgregar`; al validar, `Home` agrega el juego al estado y la lista se actualiza sola.

## Despliegue

El workflow `.github/workflows/deploy.yml` construye esta carpeta y la publica en GitHub Pages al hacer push a `main`.

## Cómo probarlo

1. Filtra por categoría y busca por nombre.
2. Agrega un juego (primero con campos vacíos para ver los errores, luego válido) y comprueba que aparece y que su categoría se puede filtrar.
3. Elimínalo con el botón rojo de su tarjeta.
4. Envía el formulario de contacto vacío, inválido y válido.
5. Cambia el ancho de la ventana para ver el diseño responsivo.
