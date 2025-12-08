"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const common_controller_1 = __importDefault(require("@controllers/common/common.controller"));
router.post("/upload-image", common_controller_1.default.uploadImage);
router.post("/upload-file", common_controller_1.default.uploadFile);
exports.default = router;
