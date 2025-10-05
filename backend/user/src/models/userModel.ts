import mongoose,{Schema} from "mongoose";

export interface Iuser extends mongoose.Document{
      _id: mongoose.Types.ObjectId;
      email: string;
      username: string;
      bookings: [Schema.Types.ObjectId]
};

const userSchema:Schema<Iuser> = new mongoose.Schema({
     email:{
        type:String,
        required:true,
        unique:true
     },
     username:{
        type:String,
        required:true
     },
     bookings:[{type:Schema.Types.ObjectId,ref:"Booking"}]
},{
    timestamps:true
});

export const user = mongoose.model("User",userSchema);