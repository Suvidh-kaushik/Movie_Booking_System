import { publishToQueue } from "../config/rabbitMQ.js";
import { redisClient } from "../config/redisDB.js";
import  {user}  from "../models/userModel.js";
import TryCatch from "../utils/TryCatch.js";
import { generateToken } from "../utils/generateToken.js";
import { admin } from "../models/adminModel.js";
import { generateUsername } from "unique-username-generator";

export const loginUser = TryCatch(async (req, res) => {
  const { email } = req.body;

  const rateLimitKey = `otp:ratelimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);
  if (rateLimit) {
    res.status(429).json({
      message: "Too may requests. Please wait before requesting new opt",
    });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey, otp, {
    EX: 300,
  });

  await redisClient.set(rateLimitKey, "true", {
    EX: 60,
  });

  const message = {
    to: email,
    subject: "OTP for Login",
    body: `Your OTP is ${otp}. It is valid for 5 minutes`,
  };

  await publishToQueue("send-mail", message);

  res.status(200).json({
    message: "OTP sent to your mail",
  });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { email, otp: enteredOtp } = req.body;

  if (!email || !enteredOtp) {
    res.status(400).json({
      message: "Email and OTP Required",
    });
    return;
  }

  const otpKey = `otp:${email}`;

  const storedOtp = await redisClient.get(otpKey);
  console.log(storedOtp, enteredOtp);
  if (!storedOtp || storedOtp != enteredOtp) {
    res.status(400).json({
      message: "Invalid or expired OTP",
    });
    return;
  }

  await redisClient.del(otpKey);

  let newUser = await user.findOne({ email });

  if (!newUser) {
    const username = generateUsername("_");
    newUser = await user.create({ username, email });
  }
  const userId = newUser._id.toString();
  const token = generateToken(userId, res);

  res.json({
    message: "User Verified",
    user: newUser,
    token,
  });
})


export const verifyAdmin = TryCatch(async (req, res) => {
  const { email, otp: enteredOtp } = req.body;

  if (!email || !enteredOtp) {
    return res.status(400).json({
      message: "Email and OTP Required",
    });
  }

  const otpKey = `otp:${email}`;

  const storedOtp = await redisClient.get(otpKey);
  console.log(storedOtp, enteredOtp);
  if (!storedOtp || storedOtp != enteredOtp) {
    return res.status(400).json({
      message: "Invalid or expired OTP",
    });
  }

  await redisClient.del(otpKey);

  let newUser = await admin.findOne({ email });

  if (!newUser) {
    const username = generateUsername("_");
    newUser = await admin.create({ username, email });
  }
  const userId = newUser._id.toString();
  generateToken(userId, res);

  return res.status(200).json({
    message: "User Verified",
    user: newUser,
  });
})

export const logout = TryCatch(async(req,res)=>{
   res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  return res.status(200).json({ message: "Logged out successfully" });
});


















// export const sendOTP = TryCatch(async (req:Request,res:Response)=>{
//         const {email} = req.body;

//     const rateLimitKey = `otp:ratelimit:${email}`
//     const rateLimit = await redisClient.get(rateLimitKey)
//     if(rateLimit){
//         res.status(429).json({
//             message:"Too many requests. Please wait before requesting new opt"
//         })
//         return;
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     const otpKey = `otp:${email}`
//     await redisClient.set(otpKey,otp,{
//         EX:300,
//     });

//     await redisClient.set(rateLimitKey,'true',{
//         EX:60
//     })
    
//     const message ={
//         to:email,
//         subject:"Your login otp code",
//         body:`Your OTP to login to express movieBooking is ${otp}, It is valid for 5 minutes`
//     }

//     await publishToQueue("send-otp",message);
    
//     return res.status(200).json({
//         message:"OTP sent successfully to your mail."
//     })
// })


// export const verifyLogin = TryCatch(async(req:Request,res:Response)=>{
//     const {email,otp} = req.body;

//     const otpKey = `otp:${email}`
//     const storedOTP = await redisClient.get(otpKey);
    
//     if(!storedOTP || storedOTP !== otp){
//         return res.status(400).json({
//             message:"Invalid or expired OTP"
//         })
//     } 

//     await redisClient.del(otpKey);

//     const existingUser = await user.findOne({email});
//     if(existingUser){
//         generateToken(existingUser.id,res);
//         return res.status(200).json({
//             message:"user logged in successfully",
//             user:{
//                 id:existingUser.id,
//                 username:existingUser.username,
//                 email:existingUser.email
//             },
//             new_user:false
//         })
//     }
//     else{
//           return res.status(200).json({
//             message:"OTP verified successfully. Please proceed to signup",
//             new_user:true,
//             email:email
//           })
//     }
// });


// export const completeSignup = TryCatch(async (req: Request, res: Response) => {
//   const { email, username } = req.body;

//   const existingEmail = await user.findOne({ email });
//   if (existingEmail) {
//     return res.status(400).json({
//       message: "Email already registered, try logging in instead",
//     });
//   }

//   const existingUsername = await user.findOne({ username });
//   if (existingUsername) {
//     return res.status(400).json({
//       message: "Username already taken, please choose another one",
//     });
//   }

//   const newUser = await user.create({
//     email,
//     username,
//   });

//   generateToken(newUser.id, res);

//   return res.status(201).json({
//     message: "user created successfully",
//     user: {
//       id: newUser.id,
//       username: newUser.username,
//       email: newUser.email,
//     },
//   });
// });


// export const initiateSignup = TryCatch(async (req: Request, res: Response) => {
//   const { email, username } = req.body;

//   const existingUser = await user.findOne({ email });
//   if (existingUser) {
//     return res.status(409).json({ message: "Email already registered." });
//   }

//   const existingUsername = await user.findOne({ username });
//   if (existingUsername) {
//     return res.status(409).json({ message: "Username already taken." });
//   }

//   const rateLimitKey = `otp:ratelimit:${email}`;
//   if (await redisClient.get(rateLimitKey)) {
//     return res.status(429).json({ message: "Too many requests." });
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   await redisClient.set(`signup:data:${email}`, JSON.stringify({ username }), {
//     EX: 600, 
//   });

//   await redisClient.set(`otp:${email}`, otp, { EX: 300 }); 
//   await redisClient.set(rateLimitKey, "true", { EX: 60 }); 

//   await publishToQueue("send-otp", {
//     to: email,
//     subject: "Your verification code",
//     body: `Your OTP is ${otp}`,
//   });

//   res.status(200).json({ message: "OTP sent to your email." });
// });


// export const verifySignup = TryCatch(async (req: Request, res: Response) => {
//   const { email, otp } = req.body;

//   const storedOtp = await redisClient.get(`otp:${email}`);
//   if (!storedOtp || storedOtp !== otp) {
//     return res.status(400).json({ message: "Invalid or expired OTP" });
//   }

//   const storedData = await redisClient.get(`signup:data:${email}`);
//   if (!storedData) {
//     return res.status(400).json({ message: "Signup data expired or not found." });
//   }

//   const { username, gender } = JSON.parse(storedData);


//    const newUser = await user.create({
//     email,
//     username,
//   });

//   await redisClient.del(`otp:${email}`);
//   await redisClient.del(`signup:data:${email}`);

//   const userId = newUser.id.toString();

//   generateToken(userId, res);

//   res.status(201).json({
//     message: "user registered successfully",
//     user: { id: userId, username, email },
//   });
// });

// export const sendLoginOTP = TryCatch(async(req,res)=>{
//     const {email} = req.body;

//     const rateLimitKey = `otp:ratelimit:${email}`
//     const rateLimit = await redisClient.get(rateLimitKey)
//     if(rateLimit){
//         res.status(429).json({
//             message:"Too many requests. Please wait before requesting new opt"
//         })
//         return;
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     const otpKey = `otp:${email}`
//     await redisClient.set(otpKey,otp,{
//         EX:300,
//     });

//     await redisClient.set(rateLimitKey,'true',{
//         EX:60
//     })
    
//     const message ={
//         to:email,
//         subject:"Your login otp code",
//         body:`Your OTP to login is ${otp}, It is valid for 5 minutes`
//     }

//     await publishToQueue("send-otp",message);

//     return res.status(200).json({
//         message:"OTP sent successfully to your mail."
//     })
// })

// export const login = TryCatch(async(req:Request,res:Response)=>{
//     const {email,otp} = req.body;
    
//     const newUser = await user.findOne({email});
//     if(!newUser){
//         return res.status(401).json({
//             message:"user not found. Please register first."
//         })
//     }

//     const otpKey = `otp:${email}`;
//     const storedOTP = await redisClient.get(otpKey);
    
//     if(!storedOTP || storedOTP !== otp){
//         return res.status(400).json({
//             message:"Invalid or expired OTP"
//         })
//     } 

//     await redisClient.del(otpKey);
//     const userId = newUser._id.toString();
//     generateToken(userId, res);

//     return res.status(200).json({
//         message:"user logged in successfully"
//     })
// })