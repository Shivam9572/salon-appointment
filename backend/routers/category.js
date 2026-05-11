import {  removeCategory, getServicesByCategory, categoryList } from "../controllers/categoryController.js";
import {validAdmin, validProvider} from "../middleware/authMiddleware.js";
import express from "express";
const router = express.Router();

router.get("/",categoryList);

router.get("/services/:categoryId", validProvider, getServicesByCategory);
router.delete("/remove/:categoryId", validAdmin, removeCategory);

export default router;