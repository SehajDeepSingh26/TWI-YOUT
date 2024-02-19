import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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

    const {userName, email, password} = req.body;
    if(!userName || !email)
        throw new ApiError(400, "Username or email is required")

    const user = await(User.findOne(
       {
        $or: [{userName, email}]
       }
    ))
    if(!user){
        throw new ApiError(404, "No user found")
    }

    const isPasswordvalid = await user.isCorrectPassword(password)
    if(!isPasswordvalid){
        throw new ApiError(401, "Wrong password, Invalid Credentials")
    }
})

export {
    registerUser,
    loginUser
}