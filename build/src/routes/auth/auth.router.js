"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_controller_1 = __importDefault(require("@controllers/auth/auth.controller"));
const rateLimiter_1 = __importDefault(require("@middleware/rateLimiter"));
const auth_validator_1 = require("@validators/auth/auth.validator");
router.post('/login', rateLimiter_1.default.loginApiLimiter, (0, auth_validator_1.loginRules)(), auth_validator_1.validate, auth_controller_1.default.login);
router.post('/login-callback', auth_controller_1.default.loginCallback);
router.post('/generate-token', auth_controller_1.default.generateTokaen);
router.post('/secure', auth_controller_1.default.authenticate);
router.delete('/logout', auth_controller_1.default.logout);
exports.default = router;
