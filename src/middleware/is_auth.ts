import { Response, NextFunction } from "express";
import response from "../utils/response";
import db from "../models/index";

const is_auth = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return response.error(res, {
      statusCode: 401,
      message: "Token Not Found",
    });
  }
  const token = authHeader.split(" ")[1];
  let decodedToken: {};
  try {
    decodedToken = ''//jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err instanceof Error) {
      (err as any).statusCode = 401;
    }
    console.log(err);
    return res.status(401).json({
      status: false,
      message: (err as Error).message,
    });
  }
  if (!decodedToken) {
    return response.error(res, {
      statusCode: 401,
      message: "Not authenticated!",
    });
  }
  req.token = decodedToken;
  const user = await db.User.findOne({
    where: { id: req.token.id },
  });
  if (!user) {
    return response.error(res, {
      statusCode: 401,
      message: "User not found!",
    });
  }

  if (user.status == false) {
    return response.error(res, {
      statusCode: 401,
      message: "Your account is inactive!",
    });
  }
  next();
};

export default is_auth;
