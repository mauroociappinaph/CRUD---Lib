import inquirer from "inquirer";
import schemas from "./lib/models/schemas.js"; // Importar todos los esquemas
import { addMissingFieldsBasedOnSchema } from "./lib/schemaCache.js"; // Función para completar campos
import axios from "axios";

const API_URL = "http://localhost:3000/api"; // Cambiar según tu configuración

async function runCLI() {
  console.log("💻 Bienvenido al CLI Interactivo para CRUD");
  console.log("📂 Esquemas disponibles:", Object.keys(schemas)); // Log de los esquemas disponibles

  // Seleccionar el esquema (tabla)
  const { selectedSchema } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedSchema",
      message: "¿Sobre qué tabla deseas operar?",
      choices: Object.keys(schemas), // Ejemplo: ['User', 'Product']
    },
  ]);

  console.log(`📌 Esquema seleccionado: ${selectedSchema}`);

  // Preguntar qué operación CRUD desea realizar
  const { operation } = await inquirer.prompt([
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

  console.log(`⚙️ Operación seleccionada: ${operation}`);

  // Procesar la operación seleccionada
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
      process.exit();
  }

  // Volver al menú principal
  console.log("🔄 Regresando al menú principal...");
  runCLI();
}

// Manejo de operaciones CRUD dinámicas
async function handleGetAll(schemaName) {
  console.log(`📋 Obteniendo todos los registros de ${schemaName}...`);
  const url = `${API_URL}/${schemaName.toLowerCase()}s`;
  console.log(`🌐 URL de la solicitud: ${url}`);

  try {
    const response = await axios.get(url);
    console.log(`✅ Datos obtenidos (${schemaName}):`, response.data);
  } catch (error) {
    console.error(`❌ Error al listar ${schemaName}s:`, error.message);
    if (error.response) {
      console.error("📋 Detalles del error:", error.response.data);
    }
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
    const records = response.data;

    // Verificar si hay registros disponibles
    if (!records || records.length === 0) {
      console.log(`⚠️ No se encontraron registros para ${schemaName}.`);
      return;
    }

    // Crear opciones para selección
    const options = records.map((record) => ({
      name: `${record.name} (ID: ${record._id})`,
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

    if (!records || records.length === 0) {
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
    const records = response.data;

    if (!records || records.length === 0) {
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
