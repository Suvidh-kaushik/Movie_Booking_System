import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref:'Movie',required: true },
  screenId: { type: mongoose.Schema.Types.ObjectId, ref: "Screen", required: true },
  theaterId: { type: mongoose.Schema.Types.ObjectId, ref: "Theater", required: true },
  showTime: { type: Date, required: true },
  showDuration: { type: Number, required: true },
  availableSeats: [[Number]]
}, { timestamps: true });

export const show = mongoose.model("Show", showSchema);
