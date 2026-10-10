# GAME_CENTER – Versión sin React (HTML + CSS + JavaScript + Bootstrap 5)

Tienda online de videojuegos, consolas y accesorios. Esta es la versión **sin React**: HTML5 semántico, CSS3, JavaScript puro y Bootstrap 5 (por CDN).
La versión con React está en la carpeta [`react/`](react/README.md).

## Funcionalidades

- **Página principal** (`index.html`) con carrusel, productos destacados y novedades.
- **Tarjetas Bootstrap** generadas dinámicamente con JavaScript (imagen, nombre, precio, descripción).
- **Filtro por categoría** (botones o menú desplegable "Categorías" de la barra) y **buscador** por nombre.
- **Página de detalle** (`detalle.html?id=N`) con cantidad y subtotal.
- **Carrito** guardado en `localStorage`.
- **Formulario de contacto** (nombre, correo y mensaje) con validación en JavaScript y mensajes de error bajo cada campo (clases `is-invalid` / `invalid-feedback` de Bootstrap).
- **Diseño responsivo** con la grilla de Bootstrap, Flexbox y CSS Grid.

## Estructura

```
index.html            Página principal
detalle.html          Detalle de un producto
assets/
  css/game.css        Estilos propios (Flexbox, Grid, media queries)
  js/comun.js         Utilidades: navbar, footer, carrito, carga y validación de JSON
  js/game.js          Lógica de la página principal (tarjetas, filtros, contacto)
  js/detalle.js       Lógica de la página de detalle
  data/               productos.json y novedades.json (datos de los videojuegos)
  img/                Imágenes
```

## Cómo ejecutarlo

No requiere instalación, pero **necesita un servidor local** porque los datos se leen con `fetch` (no funciona abriendo el archivo con `file://`).

Opción A – Python (desde la carpeta raíz del proyecto):

```bash
python3 -m http.server 8000
```

Luego abre <http://localhost:8000>.

Opción B – extensión **Live Server** de VS Code: clic derecho sobre `index.html` → *Open with Live Server*.

> Necesita conexión a internet para cargar Bootstrap desde el CDN.

## Cómo probarlo

1. **Filtro**: pulsa *Consolas*, *Juegos* o *Accesorios* y comprueba que solo se muestran esos productos; *Todos* los restaura. Escribe en el buscador y pulsa *Buscar*.
2. **Formulario**: en la sección *Escríbenos* envía el formulario vacío (aparecen los tres errores), luego con un correo inválido, y finalmente con datos correctos (aparece la confirmación).
3. **Responsivo**: reduce el ancho de la ventana (o usa las herramientas de desarrollo del navegador) y verifica el menú hamburguesa y la cantidad de columnas.

## Tecnologías

HTML5 · CSS3 · JavaScript (ES6) · Bootstrap 5.3
