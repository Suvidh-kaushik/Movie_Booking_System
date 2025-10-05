import mongoose from "mongoose";


const theaterSchema = new mongoose.Schema({
    theaterName:{
        type:String,
        required:true,
    },
    location:{
        type:String,
        required:true,
    },
    screens:[{
        type:mongoose.Schema.Types.ObjectId,ref:"Screen"
    }],
    ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
    },
});

export const theater = mongoose.model("Theater",theaterSchema);