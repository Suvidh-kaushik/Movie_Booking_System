import mongoose from "mongoose";
import { theater } from "./theaterModel.js";


const screenSchema = new mongoose.Schema({
    theaterId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Theater",
        required:true,
    },
    rows:{
        type:Number,
        default:10
    },
    cols:{
        type:Number,
        default:10
    },
    seatLayout:[[Number]],
    shows:[{type:mongoose.Schema.Types.ObjectId,ref:"Show"}]
});

export const screen = mongoose.model("Screen",screenSchema);