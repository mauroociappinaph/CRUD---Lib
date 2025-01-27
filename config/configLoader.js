import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Carga la configuración desde el archivo crud.config.js.
 *
 * Esta función intenta importar el archivo de configuración ubicado en '../crud.config.js',
 * relativo al directorio actual. Si se realiza con éxito, se registra un mensaje de éxito
 * en la consola y se devuelve la exportación predeterminada del archivo de configuración.
 * Si ocurre un error durante la importación, se registra un mensaje de error y el proceso
 * finaliza.
 *
 * @async
 * @function loadConfig
 * @returns {Promise<Object>} El objeto de configuración importado desde crud.config.js.
 * @throws {Error} Si no se puede cargar el archivo de configuración, el proceso finalizará con un código de estado 1.
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
