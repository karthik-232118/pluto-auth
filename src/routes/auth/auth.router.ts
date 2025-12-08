import express, { Express, Request, Response } from 'express';
const router = express.Router();

import authController from "@controllers/auth/auth.controller";
import rateLimiter from "@middleware/rateLimiter";

import {
    loginRules,
    validate
} from "@validators/auth/auth.validator";


router.post('/login', rateLimiter.loginApiLimiter, loginRules(), validate, authController.login);
router.post('/login-callback', authController.loginCallback);
router.post('/generate-token', authController.generateTokaen);
router.post('/secure', authController.authenticate);
router.delete('/logout', authController.logout);

export default router