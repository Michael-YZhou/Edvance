import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import morgan from "morgan";
import * as dynamoose from "dynamoose";
import serverless from "serverless-http";
import seed from "./seed/seedDynamodb";
import {
  clerkMiddleware,
  createClerkClient,
  requireAuth,
} from "@clerk/express";
/* ROUTE IMPORTS */
import courseRoutes from "./routes/courseRoutes";
import userClerkRoutes from "./routes/userClerkRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import userCourseProgressRoutes from "./routes/userCourseProgressRoutes";

/* CONFIGURATIONS */
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// set dynamoose to use local database in development
if (!isProduction) {
  dynamoose.aws.ddb.local();
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(clerkMiddleware());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/courses", courseRoutes);
app.use("/users/clerk", requireAuth(), userClerkRoutes); // protect routes with clerk auth
app.use("/transactions", requireAuth(), transactionRoutes); // protect routes with clerk auth
app.use("/users/course-progress", requireAuth(), userCourseProgressRoutes); // protect routes with clerk auth

/* SERVER */
const PORT = process.env.PORT || 3000;

/* LOCAL DEVELOPMENT ENVIRONMENT */
if (!isProduction) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

/* AWS PRODUCTION ENVIRONMENT */
// export the serverless app using serverless-http
const serverlessApp = serverless(app);

// seed the database
export const handler = async (event: any, context: any) => {
  // If the action is seed, grab the seed script and seed the database
  // This is not the best way to seed the database because someone can reseed the database by calling the handler again
  // but it's a quick and dirty way to seed the database
  if (event.action === "seed") {
    await seed();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Database seeded successfully" }),
    };
  } else {
    // if the action is not seed, return the serverless app
    return serverlessApp(event, context);
  }
};
