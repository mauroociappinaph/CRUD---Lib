import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Loads the configuration from the crud.config.js file.
 * 
 * This function attempts to import the configuration file located at '../crud.config.js'
 * relative to the current directory. If successful, it logs a success message and
 * returns the default export from the config file. If an error occurs during import,
 * it logs an error message and exits the process.
 * 
 * @async
 * @function loadConfig
 * @returns {Promise<Object>} The configuration object imported from crud.config.js.
 * @throws {Error} If the configuration file cannot be loaded, the process will exit with status code 1.
 */
export async function loadConfig() {
  const configPath = path.join(__dirname, "../crud.config.js");

  try {
    const config = await import(configPath);
    console.log("✅ Configuración cargada exitosamente.");
    return config.default; // Importa el objeto "default"
  } catch (err) {
    console.error("❌ Error al cargar `crud.config.js`:", err.message);
    process.exit(1);
  }
}
