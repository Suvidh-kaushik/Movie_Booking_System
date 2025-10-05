import mongoose,{Schema} from "mongoose";


export interface Iadmin extends mongoose.Document{
        _id: mongoose.Types.ObjectId;
        email: string;
        username: string;
        theatreIds: [Schema.Types.ObjectId];
        role: string;
    }

const adminSchema:Schema<Iadmin> = new mongoose.Schema({
     email:{
        type:String,
        required:true,
        unique:true
     },
     username:{
        type:String,
        required:true
     },
     theatreIds:[{type:Schema.Types.ObjectId,ref:"Theater"}],
     role:{
        type:String,
        default:"admin"
     }
},{
    timestamps:true
});

export const admin = mongoose.model("Admin",adminSchema);