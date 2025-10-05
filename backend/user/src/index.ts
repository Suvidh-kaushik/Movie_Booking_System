import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";
import connectToMongoDB from "./config/mongoDB.js";
import connectToRedis from "./config/redisDB.js";
import { connectToRabbitMQ } from "./config/rabbitMQ.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000


connectToRedis();
connectToMongoDB();
connectToRabbitMQ();


// initialize all packages imported
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}))
app.use(cookieParser());


// define the routes for this service

app.use("/api/v1/auth",authRouter);
app.use("/api/v1/user",userRouter);
app.use("/api/v1/admin",adminRouter);
app.use("/api/v1/booking",bookingRouter);

app.listen(PORT,() => {
    console.log(`✅ Service-1 is running on port ${PORT}`);
})