"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.loginRules = void 0;
const express_validator_1 = require("express-validator");
const response_1 = __importDefault(require("@utils/response"));
const loginRules = () => {
    return [
        (0, express_validator_1.body)('p')
            .notEmpty()
            .withMessage("payload can't be empty"),
        (0, express_validator_1.body)("iv")
            .notEmpty()
            .withMessage("iv can't be empty!")
            .isString()
            .withMessage("iv should be string")
    ];
};
exports.loginRules = loginRules;
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    const errorWithParams = {};
    errors.array().forEach((err) => extractedErrors.push(err.msg));
    errors.array().forEach((err) => errorWithParams[err.path] = err.msg);
    return response_1.default.error(res, {
        statusCode: 422,
        message: extractedErrors[0],
        errors: errorWithParams
    });
};
exports.validate = validate;
