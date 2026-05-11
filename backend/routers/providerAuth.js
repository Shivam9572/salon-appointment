import {providerLogin, providerRegister} from "../controllers/authController.js";
import express from 'express';
const router = express.Router();

router.post('/register', providerRegister);
router.post('/login', providerLogin);
export default router;