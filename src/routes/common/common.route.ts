import express from "express";
const router = express.Router();
import commonController from '@controllers/common/common.controller';

router.post("/upload-image", commonController.uploadImage);
router.post("/upload-file", commonController.uploadFile);

export default router;
