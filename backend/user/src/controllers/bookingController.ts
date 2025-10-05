import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser.js";
import TryCatch from "../utils/TryCatch.js";
import { movie } from "../models/movieModel.js";
import mongoose from "mongoose";
import { show } from "../models/showModel.js";
import { user } from "../models/userModel.js";
import { booking } from "../models/bookingModel.js";
import { publishToQueue } from "../config/rabbitMQ.js";

export const getAllMovies = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const movies = await movie.find({});
    return res.status(200).json({
        message:"Movies fetched successfully",
        movies
    });
});


export const getShowsForMovie = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const {movieId} = req.params;
    const {date} = req.query;//YYYY-MM-DD

    if(!date || typeof date !== "string" || isNaN(Date.parse(date as string))){
        return res.status(400).json({
            message:"Invalid date"
        });
    }

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

     const shows = await show.find({
      movieId: new mongoose.Types.ObjectId(movieId),
      showTime: { $gte: startOfDay, $lte: endOfDay }
      }).populate({
         path: 'theaterId',
         select: 'theaterName location'
        }).select('-__v -createdAt -updatedAt -movieId -availableSeats');


    return res.status(200).json({
        message:"Shows fetched successfully",
        shows
    });
});



export const getAvailableSeatsForShow = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const {showId} = req.params;
    const existingShow = await show.findById(showId).select('availableSeats');
    if(!existingShow){
        return res.status(404).json({
            message:"Show not found"
        });
    }
    
    return res.status(200).json({
        message:"Available seats fetched successfully",
        availableSeats:existingShow.availableSeats
    });
});



export const bookSeatsForShow = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { showId } = req.params;
  let { seats } = req.body;

  if (!showId) {
    return res.status(400).json({ message: "Show ID is required" });
  }

  const existingShow = await show.findById(showId);
  if (!existingShow) {
    return res.status(404).json({ message: "Show not found" });
  }

  if (!seats) {
    return res.status(400).json({ message: "Seats are required" });
  }

  if (!Array.isArray(seats)) seats = [seats];

  const availableSeats = existingShow.availableSeats;

  seats = seats.map((s: { row: number; col: number }) => ({ row: Number(s.row), col: Number(s.col) }));

  const invalidSeats = seats.filter((s: { row: number; col: number }) => s.row < 0 || s.row > 10 || s.col < 0 || s.col > 10);
  if (invalidSeats.length > 0) {
    return res.status(400).json({
      message: "Some seats are out of range. Rows and columns must be between 0 and 10.",
      seats: invalidSeats
    });
  }

  const unavailableSeats = seats.filter((s: { row: number; col: number }) => availableSeats[s.row]?.[s.col] === 1);

  if (unavailableSeats.length > 0) {
    return res.status(400).json({
      message: "Some seats are already booked",
      seats: unavailableSeats
    });
  }

   seats.forEach((s: { row: number; col: number }) => {
    const row = availableSeats[s.row];
    if (row) row[s.col] = 1;
   });

  await existingShow.save();

  const newBooking = await booking.create({
    userId: req.user?.id,
    showId,
    seats
  })

const bookingObject = await booking.findById(newBooking._id)
    .populate({
      path: 'showId',
      select: 'showTime showDuration screenId movieId theaterId',
      populate: [
        { path: 'theaterId', select: 'theaterName location' },
        { path: 'movieId', select: 'title' } // This ensures movieId is populated as a document
      ]
    })
    .populate({
      path: 'userId',
      select: 'name email'
    });

 if (!bookingObject) {
  return res.status(404).json({ message: "Booking not found" });
}

 const userDoc = await user.findById(req.user?.id).select('email name');
 const movieTitle = (bookingObject.showId as any).movieId.title;
 const showTime = (bookingObject.showId as any).showTime;
 const seatsBooked = bookingObject.seats.map(s => `Row: ${s.row}, Col: ${s.col}`).join('; ');

 const emailBody = `Your booking for the movie "${movieTitle}" has been confirmed.
    Showtime: ${new Date(showTime).toLocaleString()}
    Seats: ${seatsBooked}
    Enjoy your movie!
`;

await publishToQueue('send-mail', {
  to: userDoc?.email,
  subject: 'Booking Confirmation',
  body: emailBody
});

  res.status(200).json({
    message: "Seats booked successfully",
    booking: bookingObject
  });
});


export const listUserBookings = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    
    const bookings = await booking.find({userId}).populate({
      path: 'showId',
      populate: { path: 'theaterId', select: 'theaterName location'},
      select: 'showTime showDuration screenId'
    }).populate({
      path: 'userId',
      select: 'name email'
    });

   res.status(200).json({
    message:"All bookings fetched successfully",
    bookings
   });
});



export const deleteBooking = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const { bookingId } = req.body;
    
    if (!bookingId) {
        return res.status(400).json({ message: "Booking ID is required" });
    }
    const existingBooking = await booking.findById(bookingId)
    .populate({
      path: 'showId',
      select: 'showTime showDuration screenId movieId theaterId',
      populate: [
        { path: 'theaterId', select: 'theaterName location' },
        { path: 'movieId', select: 'title' } // This ensures movieId is populated as a document
      ]
    })
    .populate({
      path: 'userId',
      select: 'name email'
    });
   
    if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
    }
    const userId = req.user?._id;
    if (existingBooking.userId._id.toString() !== userId?.toString()) {
        return res.status(403).json({ message: "You are not authorized to delete this booking" });
    }

    const existingShow = await show.findById(existingBooking.showId);
    if (!existingShow) {
        return res.status(404).json({ message: "Associated show not found" });
    }
    
     const bookedSeats = existingBooking.seats;
     const availableSeats = existingShow.availableSeats;

     bookedSeats.forEach((s) => {
         const row = availableSeats[s.row];
         if (row) row[s.col] = 0; 
     });

     existingShow.availableSeats=availableSeats;
     await existingShow.save();

     await user.updateOne(
       { _id: userId },
       { $pull: { bookings: bookingId } }
     );

      const movieTitle = (existingBooking.showId as any).movieId.title;
      const showTime = (existingBooking.showId as any).showTime;
     
      const emailBody = `Your booking for the movie "${movieTitle}" has been confirmed.
    Showtime: ${new Date(showTime).toLocaleString()}
    Seats: ${bookedSeats}
    Enjoy your movie!
`;

     await publishToQueue('send-mail', {
      to: req.user?.email,
      subject: 'Booking Confirmation',
      body: emailBody
     });

     await booking.findOneAndDelete(bookingId);
     return res.status(200).json({
      messgae:"booking removed successfully"
     })
  });