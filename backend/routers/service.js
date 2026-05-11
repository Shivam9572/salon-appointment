import { deleteService, editService, getAllServices ,getServiceById} from "../controllers/serviceController.js";
import { validAdmin } from "../middleware/authMiddleware.js";
import express from "express";
const router = express.Router();


router.get("/", getAllServices);
router.put("/:id", validAdmin, editService);
router.delete("/:id", validAdmin, deleteService);
router.get("/:id", getServiceById);

export default router;