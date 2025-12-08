"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_v2_1 = __importDefault(require("multer-s3-v2"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
require("dotenv").config();
const s3 = new s3_1.default({
    region: process.env.AWS_S3_BUCKET_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const upload = async (req, res, filePath, filter) => {
    const storage = (0, multer_s3_v2_1.default)({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        // acl: "public-read",
        contentType: multer_s3_v2_1.default.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.originalname });
        },
        key: function (req, file, cb) {
            cb(null, filePath + Date.now().toString() + path.extname(file.originalname));
        },
    });
    const upload = (0, multer_1.default)({
        storage: storage,
        fileFilter: filter,
        limits: { fileSize: 5242880 },
    }).single("file");
    return new Promise((resolve, reject) => {
        upload(req, res, function (err) {
            if (req.fileValidationError) {
                return reject(req.fileValidationError);
            }
            else if (!req.file) {
                return reject("Please select a file to upload");
            }
            else if (err) {
                console.log(err);
                if (err.code === "LIMIT_FILE_SIZE") {
                    return reject("File size should not be greater than 5 MB");
                }
                return reject("Something went wrong!");
            }
            else {
                return resolve(req.file.key);
            }
        });
    });
};
const uploadFileToS3FromUrl = async (url, key) => {
    return axios_1.default
        .get(url, { responseType: "arraybuffer", responseEncoding: "binary" })
        .then((response) => {
        const params = {
            ContentType: response.headers["content-type"],
            ContentLength: response.data.length.toString(), // or response.header["content-length"] if available for the type of file downloaded
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Body: response.data,
            Key: key,
        };
        return s3.putObject(params).promise();
    });
};
const remove = async (filePath) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: filePath,
    };
    try {
        await s3.headObject(params).promise();
        console.log("File Found in S3");
        try {
            await s3.deleteObject(params).promise();
            console.log("file deleted Successfully");
        }
        catch (err) {
            console.log("ERROR in file Deleting : " + JSON.stringify(err));
        }
    }
    catch (err) {
        console.log("File not Found ERROR : " + err);
    }
};
exports.default = { upload, uploadFileToS3FromUrl, remove };
