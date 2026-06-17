import express from "express";
import cors from "cors";
import morgan from "morgan";

import orderRoutes from "./modules/order/order.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/orders", orderRoutes);

export default app;