import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  showId: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
  seats: [
    {
      row: { type: Number, required: true },
      col: { type: Number, required: true }
    }
  ],
  bookingTime: { type: Date, default: Date.now },
  status: { type: String, default: "confirmed" }
}, { timestamps: true });

export const booking = mongoose.model("Booking", bookingSchema);