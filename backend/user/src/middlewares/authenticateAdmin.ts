import type { NextFunction,Request,Response } from "express";
import TryCatch from "../utils/TryCatch.js";
import { verifyJWTtoken } from "../utils/generateToken.js";
import { admin, type Iadmin } from "../models/adminModel.js";


export interface AuthenticatedRequest extends Request{
    user?: Iadmin | null;
}

export const authenticateAdmin=TryCatch(async(req:AuthenticatedRequest,res:Response,next:NextFunction)=>{
    const token = req.cookies?.jwt;
    if(!token){
        return res.status(401).json({
            message:"You are not authenticated"
        });
    }

    const decodedToken = await verifyJWTtoken(token);
    if(!decodedToken){
        return res.status(401).json({
            message:"Invalid Token"
        });
    }
    const existingAdmin = await admin.findById(decodedToken.userId);
    if(!existingAdmin){
        return res.status(404).json({
            message:"Admin not found"
        });
    }

    req.user = existingAdmin;
    next();
});


