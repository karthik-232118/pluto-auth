"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const success = (res, obj) => {
    const { statusCode, message, data = null } = obj;
    return res.status(statusCode).json({ status: true, message, data });
};
const error = (res, e) => {
    const { statusCode, message, errors } = e;
    return res.status(statusCode).json({ status: false, message, errors });
};
exports.default = { success, error };
