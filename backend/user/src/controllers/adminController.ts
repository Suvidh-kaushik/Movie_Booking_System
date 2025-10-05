import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser.js";
import TryCatch from "../utils/TryCatch.js";
import { admin } from "../models/adminModel.js";
import { theater } from "../models/theaterModel.js";
import { screen } from "../models/screenModel.js";
import mongoose from "mongoose";
import { show } from "../models/showModel.js";
import { movie } from "../models/movieModel.js";
import cloudinary from "../imageHandlers/cloudinaryHandler.js";



export const  getAdminProfile = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if(!userId){
        return res.status(401).json({
            message:"You are not authenticated"
        });
    }
    const existingUser = await admin.findById(userId);
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

export const updateAdminUsername = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
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

  const isTaken = await admin.findOne({ username });
  if (isTaken && isTaken._id.toString() !== existingUser._id.toString()) {
    return res.status(400).json({
      message: "Username already exists. Please choose a different one.",
    });
  }

  const updatedUser = await admin.findByIdAndUpdate(
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



export const addTheater = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if(!userId){
        return res.status(401).json({
            message:"You are not authenticated"
        });
    }
    const existingUser = await admin.findById(userId);
    if(!existingUser){
        return res.status(404).json({
            message:"User not found"
        });
    }

    const {theaterName, location} = req.body;
    const newTheater = await theater.create({
        theaterName,
        location,
        ownerId: userId,
        screens:[]
    });

    await admin.findByIdAndUpdate(userId,{
        $push:{theatreIds:newTheater._id}
    });

    return res.status(201).json({
        message:"Theater added successfully",
        theater:newTheater
    });
});


export const getAllTheaters = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if(!userId){
        return res.status(401).json({
            message:"You are not authenticated"
        });
    }
    const existingUser = await admin.findById(userId).populate({ path: 'theatreIds',populate:{path: 'screens'} });
    console.log(existingUser);
    if(!existingUser){
        return res.status(404).json({
            message:"User not found"
        });
    }
    
    return res.status(200).json({
        message:"Theater fetched successfully",
        theaters:existingUser.theatreIds
    });
});


export const addScreen = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if(!userId){
        return res.status(401).json({
            message:"You are not authenticated"
        });
    }
    const {theaterId} = req.params;
    const existingUser = await admin.findById(userId);
    if(!existingUser){
        return res.status(404).json({
            message:"User not found"
        });
    }

    if(!existingUser.theatreIds.map((id: any) => id.toString()).includes(theaterId)){
        return res.status(403).json({
            message:"You are not authorized to add screen to this theater"
        });
    }
    const seatLayout = Array.from({ length: 10 }, () => Array(10).fill(0));
    console.log(seatLayout);
    const newScreen = await screen.create({
        theaterId: new mongoose.Types.ObjectId(theaterId),
        seatLayout:seatLayout,
        shows:[]
    });
    
    await theater.findByIdAndUpdate(theaterId,{
        $push:{screens:newScreen._id}
    });

    return res.status(201).json({
        message:"Screen added successfully",
        theaterId:theaterId,
        screen:newScreen
    });
});


export const getTheaterScreens = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if(!userId){
        return res.status(401).json({
            message:"You are not authenticated"
        });
    }
    const existingUser = await admin.findById(userId);
    if(!existingUser){
        return res.status(404).json({
            message:"User not found"
        });
    }
    const {theaterId} = req.params;
    if(!existingUser.theatreIds.map((id: any) => id.toString()).includes(theaterId)){
        return res.status(403).json({
            message:"You are not authorized to view screens of this theater"
        });
    }
    const existingTheater = await theater.findById(theaterId).populate('screens');
    if(!existingTheater){
        return res.status(404).json({
            message:"Theater not found"
        });
    }
    return res.status(200).json({
        message:"Screens fetched successfully",
        screens:existingTheater.screens
    });
});



export const addShow = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if(!userId){
        return res.status(401).json({
            message:"You are not authenticated"
        });
    }
    const existingUser = await admin.findById(userId);
    if(!existingUser){
        return res.status(404).json({
            message:"User not found"
        });
    }


    const {screenId} = req.params;
    const {movieId,time:showTime,duration:showDuration} = req.body;
    


    const existingScreen = await screen.findById(screenId);
    if(!existingScreen){
        return res.status(404).json({
            message:"Screen not found"
        });
    }

    if(!existingUser.theatreIds.map((id: any) => id.toString()).includes(existingScreen.theaterId.toString())){
        return res.status(403).json({
            message:"You are not authorized to add show to this screen"
        });
    }

    const movieData = await movie.findById(movieId);
    
    if (!movieData || !movieData.releaseDate) {
        return res.status(404).json({
            message: "Movie not found or release date is missing"
        });
    }

    const releaseDate = new Date(movieData.releaseDate);
    const showTimeDate = new Date(showTime);

    if (showTimeDate < releaseDate) {
        return res.status(400).json({
            message: "Show time cannot be before movie release date"
        });
    }

    if (!showTime || isNaN(Date.parse(showTime))) {
        return res.status(400).json({
            message:"Invalid show time"
        });
    }

   const newStart = new Date(showTime);
   const newEnd = new Date(newStart.getTime() + showDuration * 60000);

   const overlappingShow = await show.findOne({
        screenId: existingScreen._id,
        $expr: {
            $and: [
                { $lt: [ "$showTime", newEnd ] },
                { $gt: [ { $add: [ "$showTime", { $multiply: [ "$showDuration", 60000 ] } ] }, newStart ] }
            ]
        }
   });

    if(overlappingShow){
        return res.status(400).json({ message: "Show time overlaps with an existing show" });
    }

    const theaterId = existingScreen.theaterId;

    const newShow = await show.create({
        movieId,
        screenId: existingScreen._id,
        theaterId: theaterId,
        showTime: new Date(showTime),
        showDuration: showDuration,
        availableSeats: Array.from({ length: 10 }, () => Array(10).fill(0))
    });

    await existingScreen.updateOne({
        $push: { shows: newShow._id }
    });

    await movie.findByIdAndUpdate(movieId,{
        $push:{shows:newShow._id}
    });

    return res.status(201).json({
        message: "Show added successfully",
        show: newShow
    });
});


export const getShows = TryCatch(async (req: AuthenticatedRequest, res: Response) => {  
    const userId = req.user?._id;
    if(!userId){
        return res.status(401).json({
            message:"You are not authenticated"
        });
    }
    const existingUser = await admin.findById(userId);
    if(!existingUser){
        return res.status(404).json({
            message:"User not found"
        });
    }
    
    const {screenId} = req.params;
    const existingScreen = await screen.findById(screenId).populate('shows');
    if(!existingScreen){
        return res.status(404).json({
            message:"Screen not found"
        });
    }
    return res.status(200).json({
        message:"Shows fetched successfully",
        shows: existingScreen.shows
    });
});


export const addMovie = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if(!userId){
        return res.status(401).json({
            message:"You are not authenticated"
        });
    }
    const existingUser = await admin.findById(userId);
    if(!existingUser){
        return res.status(404).json({
            message:"User not found"
        });
    }

    const{title,duration,genre,language,releaseDate} = req.body;
    
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    if (!req.file) {
        return res.status(400).json({
            message: "No image file provided"
        });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
        folder: "movie_posters",
        transformation:{quality:70}
    });
    
    const image = result.secure_url;
    console.log("Uploaded image URL:", image);

    const newMovie = await movie.create({
        title,
        duration,
        genre,
        image,
        language,
        releaseDate
    });
    
    console.log("Created movie:", newMovie);
    
    return res.status(201).json({
        message:"Movie added successfully",
        movie:newMovie
    });
});


