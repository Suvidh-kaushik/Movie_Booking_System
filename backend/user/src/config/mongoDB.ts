import mongoose from "mongoose";

const connectToMongoDB = async () => {
    const url = process.env.MONGODB_URL;

    if(!url){
        throw new Error("MONGODB_URL is not defined in environment variables");
    }
   
    try{
       await mongoose.connect(url,{
         dbName: "Movie_Booking_Service"
       });
        console.log("✅ MongoDB has been connected successfully");
    }catch(error){
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

export default connectToMongoDB;