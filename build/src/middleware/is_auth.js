"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = __importDefault(require("../utils/response"));
const index_1 = __importDefault(require("../models/index"));
const is_auth = async (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        return response_1.default.error(res, {
            statusCode: 401,
            message: "Token Not Found",
        });
    }
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
        decodedToken = ''; //jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (err) {
        if (err instanceof Error) {
            err.statusCode = 401;
        }
        console.log(err);
        return res.status(401).json({
            status: false,
            message: err.message,
        });
    }
    if (!decodedToken) {
        return response_1.default.error(res, {
            statusCode: 401,
            message: "Not authenticated!",
        });
    }
    req.token = decodedToken;
    const user = await index_1.default.User.findOne({
        where: { id: req.token.id },
    });
    if (!user) {
        return response_1.default.error(res, {
            statusCode: 401,
            message: "User not found!",
        });
    }
    if (user.status == false) {
        return response_1.default.error(res, {
            statusCode: 401,
            message: "Your account is inactive!",
        });
    }
    next();
};
exports.default = is_auth;
