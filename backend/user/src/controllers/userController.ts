import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser.js";
import TryCatch from "../utils/TryCatch.js";
import { user } from "../models/userModel.js";




export const getUserProfile = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    console.log("req.user");
    if(!userId){
        return res.status(401).json({
            message:"You are not authenticated"
        });
    }
    const existingUser = await user.findById(userId);
    if(!existingUser){
        return res.status(404).json({
            message:"User not found"
        });
    }
    return res.status(200).json({
        message:"User profile fetched successfully",
        user:existingUser
    });
});

export const updateUsername = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { username } = req.body;
  const existingUser = req.user;

  if (!existingUser) {
    return res.status(401).json({
      message: "You are not authenticated",
    });
  }

  if (!username || typeof username !== "string") {
    return res.status(400).json({
      message: "Username is required and must be a string",
    });
  }

  const isTaken = await user.findOne({ username });
  if (isTaken && isTaken._id.toString() !== existingUser._id.toString()) {
    return res.status(400).json({
      message: "Username already exists. Please choose a different one.",
    });
  }

  const updatedUser = await user.findByIdAndUpdate(
    existingUser._id,
    { username },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    message: "Username updated successfully",
    user: updatedUser,
  });
});
