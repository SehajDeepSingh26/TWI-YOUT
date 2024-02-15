import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,     //^ Used for efficient searching, so when an attribute will get searched more, we should enable the indexing,
    },
    videoFile: {
        type: String,   //cloudinary url
        required: true,
    },
    thumbnail: {
        type: String,   //cloudinary url
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: true,
    },
    discription: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    isViews: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        required: true,
    },

}, {timestamps: true})

videoSchema.plugin(mongooseAggregatePaginate)   //^ Now we can write aggregate queries as well

export const Video = mongoose.model("Video", videoSchema)