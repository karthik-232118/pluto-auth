import { Request, Response, NextFunction } from "express";
import db from "../../models/index";
import response from "@utils/response";
import s3 from "@utils/s3bucket";
import { Op } from "sequelize";

const uploadImage = async (req: any, res: Response, next: NextFunction) => {
  try {
    const imageFilter = function (req: any, file: any, cb: any) {
      if (file) {
        req.file = file;
      }

      if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        req.fileValidationError = "Only image files are allowed!";
        return cb(new Error("Only image files are allowed!"), false);
      }
      if (file.fileSize > 5 * 1024 * 1024) {
        req.fileValidationError = "File size not be greater than 5 MB";
        return cb(new Error("File size not be greater than 5 MB"), false);
      }
      cb(null, true);
    };
    let filePath: any;
    let s3uploadError: any;
    await s3
      .upload(req, res, "cinet/images/", imageFilter)
      .then((s3response) => {
        filePath = process.env.S3_BUCKET_BASE_URL + "/" + s3response;
      })
      .catch((e) => {
        console.log(e);
        s3uploadError = e;
      });
    if (s3uploadError) {
      return response.error(res, {
        statusCode: 400,
        message: s3uploadError,
      });
    }
    return response.success(res, {
      statusCode: 200,
      message: "Image uploaded successfully",
      data: {
        filePath: filePath,
      },
    });
  } catch (error) {
    console.log(error);
    return response.error(res, {
      statusCode: 500,
      message: "Something went wrong!",
      errors: error,
    });
  }
};

const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filePath } = req.body;
    const file_path = filePath.replace(
      process.env.S3_BUCKET_BASE_URL + "/",
      ""
    );
    await s3.remove(file_path);
    return response.success(res, {
      statusCode: 200,
      message: "Image deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return response.error(res, {
      statusCode: 500,
      message: "Something went wrong!",
    });
  }
};

const uploadFile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const imageFilter = function (req: any, file: any, cb: any) {
      if (file) {
        req.file = file;
      }

      if (!file.originalname.match(/\.(pdf|PDF)$/)) {
        req.fileValidationError = "Only pdf files are allowed!";
        return cb(new Error("Only pdf files are allowed!"), false);
      }
      if (file.fileSize > 5 * 1024 * 1024) {
        req.fileValidationError = "File size not be greater than 5 MB";
        return cb(new Error("File size not be greater than 5 MB"), false);
      }
      cb(null, true);
    };
    let filePath: any;
    let s3uploadError: any;
    await s3
      .upload(req, res, "cinet/files/", imageFilter)
      .then((s3response) => {
        filePath = process.env.S3_BUCKET_BASE_URL + "/" + s3response;
      })
      .catch((e) => {
        console.log(e);
        s3uploadError = e;
      });
    if (s3uploadError) {
      return response.error(res, {
        statusCode: 400,
        message: s3uploadError,
      });
    }
    return response.success(res, {
      statusCode: 200,
      message: "Pdf uploaded successfully",
      data: {
        filePath: filePath,
      },
    });
  } catch (error) {
    console.log(error);
    return response.error(res, {
      statusCode: 500,
      message: "Something went wrong!",
      errors: error,
    });
  }
};

const getMovieRating = async (movie_id: number) => {
  try {
    const ratings = await db.Rating.findAll({
      where: { movie_id: movie_id }
    });

    if (ratings && ratings.length > 0) {
      const totalRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      return parseFloat((totalRatings / ratings.length).toFixed(1));
    }

    return 0;
  } catch (error) {
    console.log(error);
  }
};

export default {
  uploadImage,
  deleteImage,
  uploadFile,
  getMovieRating
};
