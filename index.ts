import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import db from "./src/models/index";
import response from "./src/utils/response";
import "module-alias/register";
import { createServer, Server as HTTPServer } from "http";

/**
 * @common routes
 */
import commonRoutes from "./src/routes/common/common.route";

/**
 * @admin routes
 */
import authRoutes from "./src/routes/auth/auth.router";

dotenv.config();

console.log(process.env, "process env");

const app: Express = express();
const port = process.env.PORT;

const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const httpServer = createServer(app);

(async function () {
  try {
    await db.sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

/**
 * @common routes
 */
app.use("/common", commonRoutes);

/**
 * @admin routes
 */
app.use("/api/v1/auth", authRoutes);

app.use("*", function (req: Request, res: Response) {
  response.error(res, {
    statusCode: 404,
    message: "Invalid URL!",
  });
});

// app.listen(port, () => {
//   console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
// });
httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
