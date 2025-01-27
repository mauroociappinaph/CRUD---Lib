import inquirer from "inquirer";
import schemas from "./lib/models/schemas.js"; // Importar todos los esquemas
import { addMissingFieldsBasedOnSchema } from "./lib/schemaCache.js"; // Función para completar campos
import axios from "axios";

const API_URL = "http://localhost:3000/api"; // Cambiar según tu configuración

/**
 * CLI Interactivo para CRUD
 * @description
 * - Seleccionar un esquema (tabla) para operar
 * - Seleccionar una operación CRUD para realizar
 * - Procesar la operación seleccionada
 * - Volver al menú principal
 */
async function runCLI() {
  console.log("💻 Bienvenido al CLI Interactivo para CRUD");

  while (true) {
    console.log("📂 Esquemas disponibles:", Object.keys(schemas));

    const { selectedSchema, operation } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedSchema",
        message: "¿Sobre qué tabla deseas operar?",
        choices: Object.keys(schemas),
      },
      {
        type: "list",
        name: "operation",
        message: "¿Qué operación deseas realizar?",
        choices: [
          "GET (Listar)",
          "GET (Por ID)",
          "POST (Crear)",
          "PUT (Actualizar)",
          "DELETE (Eliminar)",
          "Exit",
        ],
      },
    ]);

    console.log(`📌 Esquema seleccionado: ${selectedSchema}`);
    console.log(`⚙️ Operación seleccionada: ${operation}`);

    switch (operation) {
      case "GET (Listar)":
        await handleGetAll(selectedSchema);
        break;
      case "GET (Por ID)":
        await handleGetById(selectedSchema);
        break;
      case "POST (Crear)":
        await handleCreate(selectedSchema);
        break;
      case "PUT (Actualizar)":
        await handleUpdate(selectedSchema);
        break;
      case "DELETE (Eliminar)":
        await handleDelete(selectedSchema);
        break;
      case "Exit":
        console.log("👋 Gracias por usar el CLI. ¡Hasta pronto!");
        return;
    }
  }
}

// Manejo de operaciones CRUD dinámicas
async function handleGetAll(schemaName) {
  console.log(`📋 Obteniendo todos los registros de ${schemaName}...`);

  let continuePagination = true;

  while (continuePagination) {
    // Obtener la cantidad total de páginas y campos de filtro
    const initialResponse = await axios.get(
      `${API_URL}/${schemaName.toLowerCase()}s?page=1&limit=1`
    );
    const totalPages = Math.ceil(initialResponse.data.totalDocuments / 10); // Suponiendo un límite fijo de 10
    const fields = Object.keys(initialResponse.data.documents[0] || {});

    // Preguntar por el filtro
    const { selectedField } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedField",
        message:
          "🔍 Selecciona un campo para filtrar (o ninguno para omitir filtros):",
        choices: ["Sin filtro", ...fields],
      },
    ]);

    let filterValue = null;
    if (selectedField !== "Sin filtro") {
      try {
        // Obtener valores únicos del campo seleccionado
        const uniqueValuesResponse = await axios.get(
          `${API_URL}/${schemaName.toLowerCase()}s/unique?field=${selectedField}`
        );
        const uniqueValues = uniqueValuesResponse.data;

        // Seleccionar el valor del filtro
        const { value } = await inquirer.prompt([
          {
            type: "list",
            name: "value",
            message: `🔍 Selecciona un valor para filtrar por ${selectedField}:`,
            choices: uniqueValues,
          },
        ]);
        filterValue = value;
      } catch (error) {
        console.error(
          `❌ Error al obtener valores únicos para ${selectedField}:`,
          error.message
        );
        continue;
      }
    }

    // Preguntar por la página
    const { selectedPage } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedPage",
        message: "🔢 Selecciona una página:",
        choices: Array.from({ length: totalPages }, (_, i) => i + 1),
      },
    ]);

    // Construir filtros y parámetros
    const filters = filterValue ? { [selectedField]: filterValue } : {};
    const queryParams = new URLSearchParams({
      page: selectedPage,
      limit: 10,
      ...filters,
    }).toString();

    // Construir la URL
    const url = `${API_URL}/${schemaName.toLowerCase()}s?${queryParams}`;
    console.log(`🌐 URL de la solicitud: ${url}`);

    try {
      // Realizar la solicitud GET
      const response = await axios.get(url);

      if (response.data.documents.length > 0) {
        // Preguntar el formato de salida
        const { outputFormat } = await inquirer.prompt([
          {
            type: "list",
            name: "outputFormat",
            message: "¿Cómo deseas ver los resultados?",
            choices: ["JSON", "Tabla"],
          },
        ]);

        // Mostrar los resultados en el formato seleccionado
        if (outputFormat === "JSON") {
          console.log("✅ Respuesta en formato JSON:");
          console.log(JSON.stringify(response.data.documents, null, 2));
        } else {
          console.log("✅ Respuesta en formato tabla:");
          console.table(response.data.documents);
        }
      } else {
        console.log("⚠️ No se encontraron registros.");
      }

      console.log(`📄 Total de registros: ${response.data.totalDocuments}`);
      console.log(
        `📄 Página actual: ${response.data.currentPage} / ${response.data.totalPages}`
      );
    } catch (error) {
      console.error(`❌ Error al listar ${schemaName}:`, error.message);

      if (error.response) {
        console.error("📋 Detalles del error:", error.response.data);
      }
    }

    // Preguntar si el usuario desea continuar paginando
    const { doContinue } = await inquirer.prompt([
      {
        type: "confirm",
        name: "doContinue",
        message: "¿Quieres seleccionar otra página o aplicar otro filtro?",
        default: true,
      },
    ]);
    continuePagination = doContinue;
  }
}
async function handleGetById(schemaName) {
  console.log(
    `📋 Obteniendo todos los registros de ${schemaName} para seleccionar por nombre...`
  );

  const url = `${API_URL}/${schemaName.toLowerCase()}s`;
  console.log(`🌐 URL de la solicitud: ${url}`);

  try {
    // Obtener todos los registros
    const response = await axios.get(url);

    // Validar si la respuesta contiene un array válido
    const records = response.data.documents || []; // Ajusta esto según la estructura real de la respuesta
    if (!Array.isArray(records) || records.length === 0) {
      console.log(`⚠️ No se encontraron registros para ${schemaName}.`);
      return;
    }

    // Crear opciones para selección
    const options = records.map((record) => ({
      name: `${record.name || "Sin nombre"} (ID: ${record._id})`,
      value: record._id,
    }));

    // Permitir al usuario seleccionar un registro
    const { id } = await inquirer.prompt([
      {
        type: "list",
        name: "id",
        message: `Selecciona un ${schemaName} por su nombre:`,
        choices: options,
      },
    ]);

    console.log(`🔍 Obteniendo detalles del ${schemaName} con ID: ${id}`);

    // Realizar solicitud para obtener el detalle por ID
    const detailUrl = `${API_URL}/${schemaName.toLowerCase()}s/${id}`;
    const detailResponse = await axios.get(detailUrl);

    console.log(`✅ Detalles del ${schemaName}:`, detailResponse.data);
  } catch (error) {
    console.error(`❌ Error al obtener el ${schemaName}:`, error.message);

    // Manejo adicional para errores específicos de respuesta
    if (error.response) {
      console.error("📋 Detalles del error:", error.response.data);
    }
  }
}

async function handleCreate(schemaName) {
  console.log(`🛠️ Creando un nuevo ${schemaName}...`);
  const schema = schemas[schemaName]?.schema;

  if (!schema) {
    console.error(`❌ No se encontró el esquema para ${schemaName}.`);
    return;
  }

  const autoGenerate = await inquirer.prompt([
    {
      type: "confirm",
      name: "autoGenerate",
      message: `¿Quieres generar automáticamente los datos del ${schemaName}?`,
    },
  ]);

  let data;
  if (autoGenerate.autoGenerate) {
    console.log("🛠️ Generando datos automáticamente...");
    data = addMissingFieldsBasedOnSchema({}, schema);
    console.log("🔧 Datos generados automáticamente:", data);
  } else {
    console.log("📝 Solicitando datos manualmente...");
    data = {};
    for (const field of Object.keys(schema.obj)) {
      const { required, type } = schema.obj[field];
      const typeInfo = type?.name || "String";
      const answer = await inquirer.prompt([
        {
          type: "input",
          name: field,
          message: `Ingrese ${field} (${
            required ? "requerido" : "opcional"
          }, tipo: ${typeInfo}):`,
        },
      ]);
      data[field] = answer[field];
    }
  }

  console.log("📤 Enviando datos al servidor:", data);
  const url = `${API_URL}/${schemaName.toLowerCase()}s`;
  console.log(`🌐 URL de la solicitud: ${url}`);

  try {
    const response = await axios.post(url, data);
    console.log(`✅ ${schemaName} creado:`, response.data);
  } catch (error) {
    console.error(`❌ Error al crear el ${schemaName}:`, error.message);
    if (error.response) {
      console.error("📋 Detalles del error:", error.response.data);
    }
  }
}

async function handleUpdate(schemaName) {
  console.log(
    `📋 Obteniendo todos los registros de ${schemaName} para seleccionar por nombre...`
  );

  const url = `${API_URL}/${schemaName.toLowerCase()}s`;
  console.log(`🌐 URL de la solicitud: ${url}`);

  try {
    const response = await axios.get(url);
    const records = response.data;
    if (!Array.isArray(records) || records.length === 0) {
      console.log(`⚠️ No se encontraron registros para ${schemaName}.`);
      return;
    }

    const options = records.map((record) => ({
      name: `${record.name} (ID: ${record._id})`,
      value: record._id,
    }));

    const { id } = await inquirer.prompt([
      {
        type: "list",
        name: "id",
        message: `Selecciona un ${schemaName} a actualizar:`,
        choices: options,
      },
    ]);

    console.log(`✏️ Actualizando ${schemaName} con ID: ${id}...`);
    const schema = schemas[schemaName]?.schema;

    if (!schema) {
      console.error(`❌ No se encontró el esquema para ${schemaName}.`);
      return;
    }

    const { autoGenerate } = await inquirer.prompt([
      {
        type: "confirm",
        name: "autoGenerate",
        message:
          "¿Quieres generar automáticamente los datos para la actualización?",
      },
    ]);

    let data;
    if (autoGenerate) {
      console.log("🛠️ Generando datos automáticamente...");
      data = addMissingFieldsBasedOnSchema({}, schema);
      console.log("🔧 Datos generados automáticamente:", data);
    } else {
      console.log("📝 Solicitando datos manualmente...");
      data = {};
      for (const field of Object.keys(schema.obj)) {
        const { required, type } = schema.obj[field];
        const typeInfo = type?.name || "String";
        const answer = await inquirer.prompt([
          {
            type: "input",
            name: field,
            message: `Ingrese ${field} (${
              required ? "requerido" : "opcional"
            }, tipo: ${typeInfo}):`,
          },
        ]);
        if (answer[field]) {
          data[field] = answer[field];
        }
      }
    }

    console.log("📤 Enviando datos al servidor:", data);
    const updateUrl = `${API_URL}/${schemaName.toLowerCase()}s/${id}`;
    console.log(`🌐 URL de la solicitud: ${updateUrl}`);

    try {
      const response = await axios.put(updateUrl, data);
      console.log(`✅ ${schemaName} actualizado:`, response.data);
    } catch (error) {
      console.error(`❌ Error al actualizar el ${schemaName}:`, error.message);
      if (error.response) {
        console.error("📋 Detalles del error:", error.response.data);
      }
    }
  } catch (error) {
    console.error(
      `❌ Error al obtener registros para ${schemaName}:`,
      error.message
    );
    if (error.response) {
      console.error("📋 Detalles del error:", error.response.data);
    }
  }
}
async function handleDelete(schemaName) {
  console.log(
    `📋 Obteniendo todos los registros de ${schemaName} para seleccionar por nombre...`
  );

  const url = `${API_URL}/${schemaName.toLowerCase()}s`;
  console.log(`🌐 URL de la solicitud: ${url}`);

  try {
    const response = await axios.get(url);
    const records = response.data.documents || []; // Ajusta esto según la estructura real de la respuesta

    if (!Array.isArray(records) || records.length === 0) {
      console.log(`⚠️ No se encontraron registros para ${schemaName}.`);
      return;
    }

    const options = records.map((record) => ({
      name: `${record.name || "Sin nombre"} (ID: ${record._id})`,
      value: record._id,
    }));

    const { id } = await inquirer.prompt([
      {
        type: "list",
        name: "id",
        message: `Selecciona un ${schemaName} a eliminar:`,
        choices: options,
      },
    ]);

    console.log(`🗑️ Eliminando ${schemaName} con ID: ${id}`);
    const deleteUrl = `${API_URL}/${schemaName.toLowerCase()}s/${id}`;
    console.log(`🌐 URL de la solicitud: ${deleteUrl}`);

    try {
      const response = await axios.delete(deleteUrl);
      console.log(`✅ ${schemaName} eliminado:`, response.data);
    } catch (error) {
      console.error(`❌ Error al eliminar el ${schemaName}:`, error.message);
      if (error.response) {
        console.error("📋 Detalles del error:", error.response.data);
      }
    }
  } catch (error) {
    console.error(
      `❌ Error al obtener registros para ${schemaName}:`,
      error.message
    );
    if (error.response) {
      console.error("📋 Detalles del error:", error.response.data);
    }
  }
}

// Iniciar el CLI
runCLI();
