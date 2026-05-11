import { validProvider } from "../middleware/authMiddleware.js";
import {getProviderProfile, addService, addCategory,categoryList,providerServices,deleteService,updateProviderProfile,chairUpdate,getProviderDetails} from "../controllers/providerController.js";


import express from "express";
const router = express.Router();

router.get("/profile", validProvider, getProviderProfile);
router.put("/profile",validProvider,updateProviderProfile);
router.get("/categories", validProvider, categoryList);
router.post("/categories/:categoryId", validProvider, addCategory);
router.post("/services", validProvider, addService);
router.get("/services", validProvider, providerServices);
router.delete("/services/:id",validProvider,deleteService);
router.put("/chair",validProvider,chairUpdate);
router.get("/:providerId",getProviderDetails);
export default router;