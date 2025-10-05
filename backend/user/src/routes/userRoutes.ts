import express from "express";
import { authenticateUser } from "../middlewares/authenticateUser.js";
import { getUserProfile, updateUsername } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/self",authenticateUser,updateUsername);
userRouter.get("/self", authenticateUser,getUserProfile);


export default userRouter;  