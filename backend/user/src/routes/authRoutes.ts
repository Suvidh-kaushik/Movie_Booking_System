import express from 'express';
import { loginUser, logout, verifyAdmin, verifyUser } from '../controllers/authController.js';


const authRouter = express.Router();


// authRouter.post('/login/verify',login);
// authRouter.post('/login/otp',sendLoginOTP);
// authRouter.post('/signup/otp',initiateSignup);
// authRouter.post('/signup/verify',verifySignup);

authRouter.post('/login', loginUser);
authRouter.post('/user/verify', verifyUser);
authRouter.post("/admin/verify", verifyAdmin);
authRouter.post('/logout',logout);



export default authRouter;