import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import { exceptionHandler } from "./src/utils/handler";
import { connectDb } from "./src/config/database";
import router from "./src/routes";

const app = express();
const { EXPRESS_PORT, DB_SYNC_FLAG, NODE_ENV } = process.env;
const shouldSync = DB_SYNC_FLAG === "true";

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.get("/", (req, res) => res.status(200).json({ message: "hit check!" }));
app.use(exceptionHandler);

app.listen(EXPRESS_PORT, async () => {
  await connectDb(shouldSync); // pass "true" to alter tables
  console.info(
    "🚀 Express server started at port %d in %s mode. Time: %s",
    EXPRESS_PORT,
    NODE_ENV,
    new Date().toLocaleString()
  );
});
