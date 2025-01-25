import { Router } from "express";

export const crudify = (model, routeBase) => {
  const router = Router();

  // Obtener todos los documentos
  router.get("/", async (req, res) => {
    try {
      const documents = await model.find();
      res.json(documents);
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
