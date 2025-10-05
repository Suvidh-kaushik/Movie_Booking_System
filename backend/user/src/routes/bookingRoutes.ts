import express from "express"
import { bookSeatsForShow, getAllMovies, getAvailableSeatsForShow, getShowsForMovie, listUserBookings } from "../controllers/bookingController.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";


const bookingRouter = express.Router();


bookingRouter.get("/movie",getAllMovies);

bookingRouter.get("/:movieId/shows",getShowsForMovie);

bookingRouter.get("/show/:showId/seats",getAvailableSeatsForShow);

bookingRouter.patch("/show/:showId/book",authenticateUser,bookSeatsForShow);

bookingRouter.get("/self",authenticateUser,listUserBookings);

export default bookingRouter;