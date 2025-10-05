import express from "express";
import { authenticateAdmin } from "../middlewares/authenticateAdmin.js";
import { addMovie, addScreen, addShow, addTheater, getAdminProfile, getAllTheaters, getShows, getTheaterScreens, updateAdminUsername } from "../controllers/adminController.js";
import { admin } from "../models/adminModel.js";
import { upload } from "../imageHandlers/multerHandler.js";


const adminRouter = express.Router();


adminRouter.post("/self",authenticateAdmin,updateAdminUsername);
adminRouter.get("/self", authenticateAdmin,getAdminProfile);

adminRouter.get("/theater",authenticateAdmin,getAllTheaters);
adminRouter.post("/theater",authenticateAdmin,addTheater);


adminRouter.post("/theater/:theaterId/screen",authenticateAdmin,addScreen);
adminRouter.get("/theater/:theaterId/screen",authenticateAdmin,getTheaterScreens);

adminRouter.post("/screen/:screenId/show",authenticateAdmin,addShow);
adminRouter.get("/screen/:screenId/show",authenticateAdmin,getShows);

//make movies
// view all shows for a time for a movie


adminRouter.post("/movie",upload.single('image'),authenticateAdmin,addMovie);


// admin -> theater -> screens[] -> movie details
// screen -> shows[] 
// show -> bookings[]
// show -> movie

export default adminRouter;