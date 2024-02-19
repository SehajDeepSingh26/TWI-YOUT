import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        // id: {
        //     type: String,
        //     required: true,
        //     unique: true,
        //     lowercase: true,
        //     trim: true,
        //     index: true,     //^ Used for efficient searching, so when an attribute will get searched more, we should enable the indexing,
        // },

        username: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();      //^ i.e if password is not changed, bcrypt will not hash this password everytime.

    this.password = await bcrypt.hash(this.password, 10)     //^ to hash the password with 10 number of rounds
    next()        //^ next() is always called when dealing with middlewares
})

userSchema.methods.isPasswordCorrect = async function(password){
    //* to check if password entered is correct using bcrypt.compare()
    return await bcrypt.compare(password, this.password)     //^ returns true / false
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(            //^ generates tokens using jwt.sign()
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY          //^ to be passed like this only ** syntax -_- **
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
                //^ less vlues compared to Access Token, as this gets refresh again and again
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)