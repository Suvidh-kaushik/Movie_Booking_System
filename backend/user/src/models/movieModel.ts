import mongoose from "mongoose";


const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: Number,  //minutes
  genre: String,
  image: String, //url
  language: String,
  releaseDate: Date,
  shows:[{type:mongoose.Schema.Types.ObjectId,ref:"Show"}]
}, { timestamps: true });

export const movie = mongoose.model("Movie", movieSchema);