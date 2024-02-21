import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


//^ USED IN:    LOG-OUT, 


export const verifyJWT = asyncHandler(async (req, res, next) => {
    // we get access to the tokens from cookies sent by the request.
                                    //^ some users may be operating from mobile, and may send cookies throgh custom headers
                                    //^ when send through postman: 
                                    //* headers->  Authorization: Bearer <Token>

    try {
        const token = req.cookies?.accessToken  || req.header ("authorization")?.replace("Bearer ", "")                       
        if(!token){
            throw new ApiError(401, "Unauthorized Request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshtoken")
        if(!user){
            throw new ApiError(401, "Invalid acess Token")
        }
        
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access Token")
    }
})