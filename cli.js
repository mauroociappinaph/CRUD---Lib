#!/usr/bin/env node
import inquirer from "inquirer";
import axios from "axios";
import { faker } from "@faker-js/faker";
import {
  loadCache,
  saveCache,
  addMissingFieldsBasedOnSchema,
} from "./lib/schemaCache.js";

const API_URL = "http://localhost:3000/api/users";
// Función principal del CLI
async function runCLI() {
  console.log("💻 Bienvenido al CLI Interactivo para CRUD");

  while (true) {
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

    // Ejecutar la operación seleccionada
    switch (operation) {
      case "GET (Listar)":
        await handleGetAll();
        break;
      case "GET (Por ID)":
        await handleGetById();
        break;
      case "POST (Crear)":
        await handleCreate();
        break;
      case "PUT (Actualizar)":
        await handleUpdate();
        break;
      case "DELETE (Eliminar)":
        await handleDelete();
        break;
      case "Exit":
        console.log("👋 Gracias por usar el CLI. ¡Hasta pronto!");
        process.exit(0);
      default:
        console.log("❌ Operación no válida.");
    }
  }
}

// Función para listar todos los usuarios
// Función para listar todos los usuarios con paginación y filtros
async function handleGetAll() {
  // Solicitar parámetros de paginación y filtro al usuario
  const { page, limit, search } = await inquirer.prompt([
    {
      type: "input",
      name: "page",
      message: "¿Qué página deseas ver?",
      default: 1,
    },
    {
      type: "input",
      name: "limit",
      message: "¿Cuántos usuarios por página?",
      default: 5,
    },
    {
      type: "input",
      name: "search",
      message: "Buscar por nombre (opcional):",
      default: "",
    },
  ]);

  try {
    console.log("📤 Solicitando datos al servidor...");
    // Enviar solicitud al backend con los parámetros de consulta
    const response = await axios.get(API_URL, {
      params: {
        page,
        limit,
        search, // Pasar el término de búsqueda
      },
    });

    // Mostrar resultados en la consola
    console.log(`📋 Página ${response.data.page}/${response.data.totalPages}`);
    console.log("Usuarios encontrados:");
    console.table(response.data.data); // Mostrar los usuarios en formato tabla
  } catch (err) {
    console.error("❌ Error al obtener usuarios:", err.message);
  }
}

// Función para obtener un usuario por ID
async function handleGetById() {
  let users = [];
  try {
    const response = await axios.get(API_URL);
    console.log("📋 Respuesta de la API:", response.data); // Inspeccionar respuesta
    users = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (err) {
    console.error("❌ Error al obtener los usuarios:", err.message);
    return;
  }

  if (!Array.isArray(users) || users.length === 0) {
    console.log("⚠️ No hay usuarios disponibles.");
    return;
  }

  const userOptions = users.map((user) => ({
    name: `${user.name} (ID: ${user._id})`,
    value: user._id,
  }));

  userOptions.push({ name: "Go Back", value: "goBack" });

  const { id } = await inquirer.prompt([
    {
      type: "list",
      name: "id",
      message: "Selecciona un usuario para ver:",
      choices: userOptions,
    },
  ]);

  if (id === "goBack") return;

  try {
    const response = await axios.get(`${API_URL}/${id}`);
    console.log("📋 Detalles del usuario:", response.data);
  } catch (err) {
    console.error("❌ Error al obtener el usuario:", err.message);
  }
}

// Función para crear un usuario

async function handleCreate() {
  console.log("🛠️ Iniciando creación de usuario...");

  // Cargar el esquema desde el cache
  console.log("🔍 Cargando esquema desde el cache...");
  const schemaCache = loadCache();

  if (!schemaCache["User"]) {
    console.warn("⚠️ No se encontró el esquema para 'User' en el cache.");
  }

  const { autoGenerate } = await inquirer.prompt([
    {
      type: "confirm",
      name: "autoGenerate",
      message: "¿Quieres generar automáticamente los datos del usuario?",
    },
  ]);

  let userData;

  if (autoGenerate) {
    userData = {
      name: faker.lorem.words(2),
      email: faker.internet.email(),
      age: faker.number.int({ min: 1, max: 100 }),
      address: faker.location.streetAddress(),
      isActive: faker.datatype.boolean(),
      password: faker.internet.password(), // Generar automáticamente el password
    };

    // Completar campos faltantes basados en el esquema
    userData = addMissingFieldsBasedOnSchema(userData);
    console.log("🔧 Datos generados automáticamente:", userData);
  } else {
    const { name, email, age, address, isActive } = await inquirer.prompt([
      { type: "input", name: "name", message: "Nombre del usuario:" },
      { type: "input", name: "email", message: "Email del usuario:" },
      { type: "input", name: "age", message: "Edad del usuario:" },
      { type: "input", name: "address", message: "Dirección del usuario:" },
      {
        type: "confirm",
        name: "isActive",
        message: "¿El usuario está activo?",
        default: true,
      },
    ]);

    // Generar automáticamente el password incluso para datos manuales
    userData = {
      name,
      email,
      age: parseInt(age),
      address,
      isActive,
      password: faker.internet.password(), // Generar automáticamente el password
    };

    // Completar campos faltantes basados en el esquema
    userData = addMissingFieldsBasedOnSchema(userData);
    console.log("📥 Datos ingresados manualmente:", userData);
  }

  try {
    console.log("📤 Enviando datos al servidor para crear usuario...");
    const response = await axios.post(API_URL, userData);
    console.log("✅ Usuario creado:", response.data);

    // Actualizar el cache si el esquema cambia en el servidor
    if (response.data.updatedSchema) {
      console.log("♻️ Actualizando el cache con el nuevo esquema...");
      schemaCache["User"] = response.data.updatedSchema; // Simula una respuesta con esquema actualizado
      saveCache(schemaCache);
      console.log("✅ Cache actualizado.");
    }
  } catch (err) {
    console.error(`❌ Error al crear el usuario: ${err.message}`);
  }
}
async function handleUpdate() {
  console.log("🛠️ Iniciando actualización de usuario...");
  let users = [];

  try {
    console.log("📤 Solicitando lista de usuarios al servidor...");
    const response = await axios.get(API_URL);
    console.log("📋 Respuesta de la API:", response.data); // Inspeccionar respuesta
    users = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (err) {
    console.error("❌ Error al obtener los usuarios:", err.message);
    return;
  }

  if (!Array.isArray(users) || users.length === 0) {
    console.log("⚠️ No hay usuarios disponibles para actualizar.");
    return;
  }

  const userOptions = users.map((user) => ({
    name: `${user.name} (ID: ${user._id})`,
    value: user._id,
  }));

  userOptions.push({ name: "Go Back", value: "goBack" });

  const { id } = await inquirer.prompt([
    {
      type: "list",
      name: "id",
      message: "Selecciona un usuario para actualizar:",
      choices: userOptions,
    },
  ]);

  if (id === "goBack") return;

  const { autoGenerate } = await inquirer.prompt([
    {
      type: "confirm",
      name: "autoGenerate",
      message:
        "¿Quieres generar automáticamente los datos para la actualización?",
    },
  ]);

  let updateData;

  if (autoGenerate) {
    updateData = {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 80 }),
      address: faker.address.streetAddress(),
      isActive: faker.datatype.boolean(),
    };
    console.log(
      "🔧 Datos generados automáticamente para la actualización:",
      updateData
    );
  } else {
    const { name, email, age, address, isActive } = await inquirer.prompt([
      { type: "input", name: "name", message: "Nuevo nombre del usuario:" },
      { type: "input", name: "email", message: "Nuevo email del usuario:" },
      { type: "input", name: "age", message: "Nueva edad del usuario:" },
      {
        type: "input",
        name: "address",
        message: "Nueva dirección del usuario:",
      },
      {
        type: "confirm",
        name: "isActive",
        message: "¿El usuario está activo?",
        default: true,
      },
    ]);
    updateData = { name, email, age: parseInt(age), address, isActive };
    console.log(
      "📥 Datos ingresados manualmente para la actualización:",
      updateData
    );
  }

  try {
    console.log(
      `📤 Enviando solicitud de actualización al servidor para ID ${id}...`
    );
    const response = await axios.put(`${API_URL}/${id}`, updateData);
    console.log("✅ Usuario actualizado exitosamente:", response.data);
  } catch (err) {
    console.error(`❌ Error al actualizar el usuario: ${err.message}`);
  }
}
async function handleDelete() {
  console.log("🛠️ Iniciando eliminación de usuario...");
  let users = [];

  try {
    console.log("📤 Solicitando lista de usuarios al servidor...");
    const response = await axios.get(API_URL);
    console.log("📋 Respuesta de la API:", response.data); // Inspeccionar respuesta
    users = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (err) {
    console.error("❌ Error al obtener los usuarios:", err.message);
    return;
  }

  if (!Array.isArray(users) || users.length === 0) {
    console.log("⚠️ No hay usuarios disponibles para eliminar.");
    return;
  }

  const userOptions = users.map((user) => ({
    name: `${user.name} (ID: ${user._id})`,
    value: user._id,
  }));

  userOptions.push({ name: "Go Back", value: "goBack" });

  const { id } = await inquirer.prompt([
    {
      type: "list",
      name: "id",
      message: "Selecciona un usuario para eliminar:",
      choices: userOptions,
    },
  ]);

  if (id === "goBack") return;

  const { confirmDelete } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmDelete",
      message: `¿Estás seguro de que deseas eliminar al usuario con ID ${id}?`,
    },
  ]);

  if (!confirmDelete) {
    console.log("❌ Eliminación cancelada.");
    return;
  }

  try {
    console.log(
      `📤 Enviando solicitud de eliminación al servidor para ID ${id}...`
    );
    await axios.delete(`${API_URL}/${id}`);
    console.log("✅ Usuario eliminado exitosamente.");
  } catch (err) {
    console.error(`❌ Error al eliminar el usuario: ${err.message}`);
  }
}

runCLI();
