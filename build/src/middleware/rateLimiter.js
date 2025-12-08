"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const loginApiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 3 requests per `window` (here, per 1 minute)
    headers: true, // Return rate limit info in the `RateLimit-*` headers
    handler: (req, res) => {
        return res.status(429).json({
            status: false,
            message: 'You sent too many requests. Please wait a while then try again'
        });
    }
});
exports.default = {
    loginApiLimiter
};
