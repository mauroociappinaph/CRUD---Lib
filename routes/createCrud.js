import { Router } from "express";
import schemas from "../lib/models/schemas.js";

const router = Router();

// Crear rutas CRUD dinámicamente para cada modelo en schemas.js
Object.keys(schemas).forEach((modelName) => {
  const Model = schemas[modelName];

  console.log(`📄 Configurando rutas para el modelo: ${modelName}`);

  // Obtener todos los registros
  router.get(`/${modelName.toLowerCase()}`, async (req, res) => {
    try {
      const records = await Model.find();
      res.json(records);
    } catch (error) {
      res.status(500).json({
        message: `Error al obtener los registros de ${modelName}`,
        error: error.message,
      });
    }
  });

  // Obtener un registro por ID
  router.get(`/${modelName.toLowerCase()}/:id`, async (req, res) => {
    const { id } = req.params;
    try {
      const record = await Model.findById(id);
      if (!record) {
        return res.status(404).json({ message: `${modelName} no encontrado` });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({
        message: `Error al obtener el registro de ${modelName}`,
        error: error.message,
      });
    }
  });

  // Crear un nuevo registro
  router.post(`/${modelName.toLowerCase()}`, async (req, res) => {
    try {
      const newRecord = new Model(req.body);
      const savedRecord = await newRecord.save();
      res.status(201).json(savedRecord);
    } catch (error) {
      res.status(400).json({
        message: `Error al crear un registro en ${modelName}`,
        error: error.message,
      });
    }
  });

  // Actualizar un registro por ID
  router.put(`/${modelName.toLowerCase()}/:id`, async (req, res) => {
    const { id } = req.params;
    try {
      const updatedRecord = await Model.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedRecord) {
        return res.status(404).json({ message: `${modelName} no encontrado` });
      }
      res.json(updatedRecord);
    } catch (error) {
      res.status(400).json({
        message: `Error al actualizar el registro en ${modelName}`,
        error: error.message,
      });
    }
  });

  // Eliminar un registro por ID
  router.delete(`/${modelName.toLowerCase()}/:id`, async (req, res) => {
    const { id } = req.params;
    try {
      const deletedRecord = await Model.findByIdAndDelete(id);
      if (!deletedRecord) {
        return res.status(404).json({ message: `${modelName} no encontrado` });
      }
      res.json({
        message: `${modelName} eliminado`,
        record: deletedRecord,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error al eliminar el registro en ${modelName}`,
        error: error.message,
      });
    }
  });
});

export default router;
