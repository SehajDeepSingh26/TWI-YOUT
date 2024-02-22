import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(userId) =>{
    try {
        //~ STEPS: 
        //^ Find User by userId
        //^ generate access token and refresh token
        //^ save them to databse
        //^ return Access and Refresh Token

        const user = await(User.findById(userId));
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})      //^ Doing this, we can save the updated values to the db but also make sure, that fields like password which always need to be passed do not throw error, as password doesn't need to be updated every time we male changes.

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(404, "Something went wrong while generating Access or Refresh Token.")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    
    // & STEPS to be followed for REGISTER of a new user
    //^  1. Deconstruct the request obj;
    //^  2. check if all the required properties are provided and valid
    //^  3. get avatar with multer middleware
    //^  4. store it in the public temp folder 
    //^  5. then store the avatar in the cloudinary or other s3 buckets, then unlink the avatar using fs.unlink method, then store the link as a string in the db
    //^  6. create the user
    //^  7. Remove password and refresh Token from the database
    //^  8. Check createdUser
    //^  9. return a response with status code, token using the methods we defined in the model file and a user object for the frontend to work with.


    //~ STEP 1:
    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    //~ STEP 2
    // if(fullName === ""){
    //     throw new ApiError(400, "fullName not found")
    // }          //^ we can write many if-else conditions to check and validate the details.
    
    //^  SHORTCUT
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //~ STEP 3:
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    //~ STEP 4
    const avatarLocalImage = req.files?.avatar[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalImage){
        throw new ApiError(404, "Avatar not found, is required")
    }

    //~ STEP 5
    const avatar = await uploadOnCloudinary(avatarLocalImage);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(404, "Avatar not found, is required")
    }
   
    // console.log(username)
    //~ STEP 6
    const user = await User.create({
        fullName,
        avatar: avatar.url,       //^ we are using .url here, because cloudinary is returning full response, but we need just url to store in database.
        coverImage: coverImage?.url || "",      //^ we have to check if coverImage is present or not, and if present store url of it.
        email, 
        password,
        username: username.toLowerCase()
    })
    // console.log(req.files)

    //~ STEP 7

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"            //^ password and RefreshToken will be removed from the database.
    )

    //~ STEP 8
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler(async (req, res) =>{

    //& STEPS for Login by the user
    //^ req body -> data
    //^ username or email
    //^ find user
    //^ check the password
    //^ access and refresh token
    //^ send cookies
    
    console.log(req.body)
    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    const user = await User.findOne(
        {
            $or: [{username, email}]
        }
    )
    console.log(user)
    if(!user){
        throw new ApiError(404, "No user found")
    }

    const isPasswordvalid = await user.isPasswordCorrect(password)
    if(!isPasswordvalid){
        throw new ApiError(401, "Wrong password, Invalid Credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpsOnly: true,        //^ by default, anyone from browser can access cookies, but this ensures only the server can access them
        secure: true            //^ They can see these cookies, but cannot modify them through frontend.
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(        // sent in format of ApiResponse.
            200,        //statusCode
            {           //data
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"       //msg
        )
    )

})

const logoutUser = asyncHandler(async (req,res) => {
    //^ STEPS: remove accessToken and refreshToken and remove cookies
    //^ We have req.user's access as well, as we passed a middleware called verifyJWT, which returns user.
    //^ so we donot need to pass user details in body of postman while sending request

    //~ User.findById can be used,--> bring user, then delete its refresh token, save and then validateBeforeFalse have to be done.
    //~better approach->
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true       //^ return response with updated value
        }
    )
    const options = {
        httpsOnly: true,        
        secure: true            
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User Logged-Out")
    )
    
})

const refreshAccessToken = asyncHandler(async(req,res) => {
        //^ During login we generate 2 tokens 1) access-token 2) refresh token
        //^ We save refresh-token in DB and set access-token and refresh-token cookie in chrome
        //^ Access-token is for short time and refresh-token is for long time
        //^ When user access-token is expired it send refresh token to Back-end
        //^ Back-end checks if DB refresh-token and user refresh-token is same or not 
        //^ If same, it generates both token again and repeat process of saving RT in Db and set cookie with RT and AT

        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if(!incomingRefreshToken)
            throw new ApiError(401, "unauthorized request")

        try {
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )
    
            const user = await User.findById(decodedToken?.id)
            if(!user)
                throw new ApiError(401, "Invalid Refresh Token")
    
            if(incomingRefreshToken !== User?.refreshToken)
                throw new ApiError(401, "Refresh token is expired or used")
            
            const options = {
                httpOnly: true,
                secure: true
            }
            
            const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    }, 
                    "Access Token Refreshed"
                )
            )
        } catch (error) {
            throw new ApiError(error?.message || "invalid refreshToken")
        }
    
    
})

const changecurrentPassword = asyncHandler(async(req, res) => { 
    //^ We do not need to think about login of user, as we can ensure that while configuring routes using jwt middleware.

    const {oldPassword, newPassword} = req.body

    //^ As we know user is logged in via auth middleware, we have acces to user._id from auth middleware.
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "New password changed successfully !")
    )

})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "current user fetched successfully")
    )
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body
    if(!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email
            }
        },
        {new: true}

    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "User Details Updated successfully"))

})

const updateUserAvatar = asyncHandler(async(req, res) => {
    //& STEPS:
    //^ 1. Taking the new Avatar Image from the inserted middlware multer requests.files and validate
    //^ 2. upload on the server locally
    //^ 3. delete the cloudinary url which is store in the User.avatar field
    //^ 4. uploading new avatar ( received ) image on the cloudinary and take the url from the cloudinary and then updating the user.avatar filed in the database

    const avatarLocalPath = req.file?.path         
        // above (while registering) req.files was used to get multiple(avatar, coverImage), here no need
    if(!avatarLocalPath)
        throw new ApiError(401, "missing avatar file")

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url)
        throw new ApiError(401, "Error while uploading avatar")

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(
        200, user, "User Avatar updated"
    ))
})

const updateUserCoverImage = asyncHandler(async(req, res) => {

    const coverImageLocalPath = req.file?.path         
        // above(while registering) req.files was used to get multiple(avatar, coverImage), here no need
    if(!coverImageLocalPath)
        throw new ApiError(401, "missing coverImage file")

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url)
        throw new ApiError(401, "Error while uploading cover Image")

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(
        200, user, "Cover image updated"
    ))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changecurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}