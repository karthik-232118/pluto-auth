import S3 from "aws-sdk/clients/s3";
import multer from "multer";
import multerS3 from "multer-s3-v2";
import * as path from "path";
import axios from "axios";
require("dotenv").config();

const s3 = new S3({
  region: process.env.AWS_S3_BUCKET_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const upload = async (req: any, res: any, filePath: any, filter: any) => {
  const storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    // acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req: any, file: any, cb: any) {
      cb(null, { fieldName: file.originalname });
    },
    key: function (req: any, file: any, cb: any) {
      cb(
        null,
        filePath + Date.now().toString() + path.extname(file.originalname)
      );
    },
  });
  const upload = multer({
    storage: storage,
    fileFilter: filter,
    limits: { fileSize: 5242880 },
  }).single("file");
  return new Promise((resolve, reject) => {
    upload(req, res, function (err: any) {
      if (req.fileValidationError) {
        return reject(req.fileValidationError);
      } else if (!req.file) {
        return reject("Please select a file to upload");
      } else if (err) {
        console.log(err);
        if (err.code === "LIMIT_FILE_SIZE") {
          return reject("File size should not be greater than 5 MB");
        }
        return reject("Something went wrong!");
      } else {
        return resolve(req.file.key);
      }
    });
  });
};

const uploadFileToS3FromUrl = async (url: any, key: any) => {
  return axios
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

const remove = async (filePath: any) => {
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
    } catch (err) {
      console.log("ERROR in file Deleting : " + JSON.stringify(err));
    }
  } catch (err) {
    console.log("File not Found ERROR : " + err);
  }
};

export default { upload, uploadFileToS3FromUrl, remove };
