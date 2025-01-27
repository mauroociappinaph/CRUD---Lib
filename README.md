# faster-crud

## Introducción

`faster-crud` es una librería dinámica para operaciones CRUD basada en Mongoose. Diseñada para desarrolladores de Node.js, esta herramienta incluye soporte para CLI, validación avanzada, y documentación automática con Swagger. Es ideal para crear rápidamente aplicaciones escalables con MongoDB.

## Características Principales

- **CRUD dinámico**: Soporte para operaciones CRUD automáticas.
- **CLI**: Herramienta de línea de comandos para generar modelos y configuraciones.
- **Validación avanzada**: Uso de `joi` para asegurar datos robustos.
- **Integración con Swagger**: Documentación interactiva disponible en `/api-docs`.
- **Middleware**:
  - **Sanitización de entradas**: Protege contra inyecciones.
  - **Helmet**: Mejora la seguridad HTTP.
  - **Rate limiting**: Previene abusos en las solicitudes.
- **Paginación**: Soporte para listar datos de manera eficiente.

## Requisitos Previos

- **Node.js**: v16.0.0 o superior.
- **MongoDB**: Configurado y accesible.

### Dependencias

- `mongoose`: Conexión y manipulación de datos en MongoDB.
- `joi`: Validación de esquemas.
- `swagger-ui-express`: Generación de documentación API.
- `express`: Framework HTTP.

## Guía de Instalación

### Instalación de la librería

Ejecute el siguiente comando:

```bash
npm install faster-crud
```

### Configuración inicial

Cree un archivo `.env` para configurar las variables de entorno:

```env
MONGO_URI=su_conexion_mongo
PORT=3000
```

## Uso Básico

### Importar y configurar la librería

```javascript
import fasterCrud from "faster-crud";

// Inicializar la librería
fasterCrud.initialize({
  mongooseURI: process.env.MONGO_URI,
  swagger: true,
});
```

### CLI

Ejecute el CLI con el siguiente comando:

```bash
npx faster-crud
```

## Documentación Completa de APIs

### Endpoints principales

#### **`/api/users`**

- **GET**: Obtiene todos los usuarios.
  - **Respuesta**:
    ```json
    [
      {
        "_id": "123",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ]
    ```
- **POST**: Crea un nuevo usuario.
  - **Parámetros** (en el cuerpo):
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "securepassword"
    }
    ```

## Casos de Uso

1. **Aplicaciones con MongoDB**: Crear APIs rápidas y escalables.
2. **Proyectos de prototipo**: Generar CRUDs dinámicos con poca configuración.
3. **Sistemas con seguridad avanzada**: Uso de middlewares preconfigurados.

## Pruebas y Validaciones

### Ejecutar pruebas

La librería incluye pruebas unitarias:

```bash
npm test
```

## Contribución

Para colaborar:

1. Haz un fork del repositorio: [GitHub](https://github.com/mauroociappinaph/CRUD---Lib).
2. Crea una rama para tus cambios:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Envía un pull request detallando los cambios.

## Licencia

Este proyecto está bajo la licencia MIT. Puedes usarlo libremente para fines personales o comerciales.

## Notas Adicionales

- Para documentación interactiva, visita `/api-docs` en tu servidor local.
- Personaliza los esquemas de datos en `crud.config.js`.
