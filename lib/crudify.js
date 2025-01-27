import { Router } from "express";
import Joi from "joi";

/**
 * Genera rutas CRUD para un modelo de Mongoose.
 * @param {Mongoose.Model} model - Modelo de Mongoose.
 * @param {string} routeBase - Prefijo para la ruta base.
 * @returns {Router} - Router de Express con las rutas CRUD.
 */
export const crudify = (model, routeBase) => {
  const router = Router();

  // Obtener todos los documentos
  // Obtener todos los documentos con filtro de valores iguales
  router.get("/", async (req, res) => {
    try {
      // Capturar los filtros enviados en la query y parámetros de paginación
      const { page = 1, limit = 10, ...filters } = req.query;

      // Convertir `page` y `limit` a números enteros
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      // Validar que los valores de paginación sean positivos
      if (pageNumber < 1 || limitNumber < 1) {
        return res.status(400).json({
          message: "Los valores de 'page' y 'limit' deben ser positivos.",
        });
      }

      // Calcular el número de documentos a saltar
      const skip = (pageNumber - 1) * limitNumber;

      // Ejecutar la consulta con filtros, paginación y conteo total
      const [documents, totalDocuments] = await Promise.all([
        model.find(filters).skip(skip).limit(limitNumber),
        model.countDocuments(filters),
      ]);

      // Calcular el total de páginas
      const totalPages = Math.ceil(totalDocuments / limitNumber);

      // Respuesta con información de paginación
      res.json({
        totalDocuments,
        totalPages,
        currentPage: pageNumber,
        documents,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Obtener un documento por ID
  router.get("/:id", async (req, res) => {
    try {
      const document = await model.findById(req.params.id);
      if (!document) {
        return res.status(404).json({ message: `${routeBase} no encontrado` });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Crear un nuevo documento
  router.post("/", async (req, res) => {
    try {
      const newDocument = new model(req.body);
      await newDocument.save();
      res.status(201).json(newDocument);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Actualizar un documento por ID
  router.put("/:id", async (req, res) => {
    try {
      const updatedDocument = await model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedDocument) {
        return res.status(404).json({ message: `${routeBase} no encontrado` });
      }
      res.json(updatedDocument);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Eliminar un documento por ID
  router.delete("/:id", async (req, res) => {
    try {
      const deletedDocument = await model.findByIdAndDelete(req.params.id);
      if (!deletedDocument) {
        return res.status(404).json({ message: `${routeBase} no encontrado` });
      }
      res.json({ message: `${routeBase} eliminado` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
