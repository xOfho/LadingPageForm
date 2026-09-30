# Campaña Pajarito Azul - Landing Page & Formulario de Aporte

Proyecto web interactivo desarrollado bajo las pautas de **Apple Human Interface Guidelines (HIG)** con una estética visual limpia, paleta azul pajarito con efecto cristal (*liquid glass*), tipografía legible y controles nativos estilizados.

---

### 🌟 Características Principales

1. **Diseño Apple HIG & Liquid Glass:**
   - Paleta cromática: azul pajarito suave (`#e0f2fe`, `#38bdf8`), azul Apple (`#0071e3`) y azul marino de contraste.
   - Efectos de desenfoque de fondo (*backdrop-filter: blur*), bordes sutiles y tarjetas con sombras de profundidad natural.
   - Totalmente responsivo para móviles, tablets y monitores.

2. **Formulario de Compromiso de Aporte:**
   - Campos requeridos: **Número de estudiante / Carnet**, **Nombre completo**, **Teléfono / WhatsApp**, **Grupo** y monto estimado opcional.
   - **Check obligatorio** para confirmar el aporte solidario.
   - Sección de **Condiciones y Restricciones** de la campaña con check de aceptación.
   - Restricción de unicidad para evitar que una misma persona se duplique.
   - Generación de código de confirmación anónimo para resguardo de privacidad.

3. **Control de Tiempo y Desactivación del Enlace:**
   - Temporizador de **3 horas** con cuenta regresiva en vivo.
   - Al terminar los 180 minutos (o al desactivarlo manualmente desde el panel), la web entra en estado "Enlace Finalizado" impidiendo nuevos registros.
   - Opción para reiniciar la ventana de 3 horas cuando sea necesario.

4. **Protección Anti-Captura / Blockscreen:**
   - Activa una cortina de seguridad si se presiona la tecla `PrintScreen`, atajos de captura de Windows (`Win+Shift+S`) o Mac (`Cmd+Shift+3/4/5`).
   - Bloquea la visualización cuando la ventana pierde el foco o se cambia de pestaña (`blur` / `visibilitychange`).
   - Clic derecho y arrastre deshabilitados para evitar inspección rápida o guardado de elementos.

5. **Panel de Administración y Resultados:**
   - Acceso con contraseña (clave por defecto: `admin123`).
   - Vista en tiempo real del listado de donantes y métricas de compromiso.
   - Botón para exportar todos los resultados a un archivo Excel/CSV descargable.
   - Botón para activar/desactivar el enlace inmediatamente o limpiar la base de datos local.

---

### 📂 Estructura del Proyecto

```
bluebird_fundraiser/
├── index.html        # Estructura principal y componentes
├── css/
│   └── styles.css    # Tokens de diseño Apple, Glassmorphism y estilos
├── js/
│   ├── app.js        # Lógica de temporizador, validaciones y panel admin
│   └── security.js   # Capa de bloqueo y defensa anti-captura
└── README.md         # Documentación de uso
```

### 🚀 Cómo Ejecutarlo

Basta con descomprimir el archivo `.zip` y abrir `index.html` en cualquier navegador web moderno (Safari, Chrome, Firefox, Edge, etc.) o servirlo en un hosting web / Cloudflare Pages.
