import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import db from "./config/database.js";
import {
  UsersRoute,
  AuthRoute,
  RecipeRoute,
  FavouriteRoute,
  CategoriesRoute,
  ProfileRoutes,
} from "./routes/initialize.route.js";

dotenv.config();

const productionENV = process.env.APP_ENVIRONMENT === "production";
const originENV = process.env.APP_ORIGIN !== null;

const app = express();

(async () => {
  db.sync();
})();

app.set("trust proxy", 1);

app.use(cookieParser());

app.use(
  cors({
    origin: originENV,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: productionENV,
      sameSite: productionENV ? "none" : "lax",
    },
  }),
);

app.use(express.urlencoded({ extended: true }));

app.use("/api/users", UsersRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/recipes", RecipeRoute);
app.use("/api/favourite", FavouriteRoute);
app.use("/api/categories", CategoriesRoute);
app.use("/api/profile", ProfileRoutes);

app.listen(process.env.APP_PORT, () =>
  console.log("Server berjalan dengan baik dan tangguh..."),
);
