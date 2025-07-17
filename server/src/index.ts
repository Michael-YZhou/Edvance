import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import morgan from "morgan";
import * as dynamoose from "dynamoose";
/* ROUTE IMPORTS */
import courseRoutes from "./routes/courseRoutes";

/* CONFIGURATIONS */
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// set dynamoose to use local database in development
if (!isProduction) {
  dynamoose.aws.ddb.local();
}

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/courses", courseRoutes);

/* SERVER */
const PORT = process.env.PORT || 3000;

if (!isProduction) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
