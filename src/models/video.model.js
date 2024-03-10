import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        // id: {
        //     type: String,
        //     required: true,
        //     unique: true,
        //     lowercase: true,
        //     trim: true,
        //     index: true,     //^ Used for efficient searching, so when an attribute will get searched more, we should enable the indexing,
        // },

        videoFile: {
            type: String, //cloudinary url
            required: true
        },

        thumbnail: {
            type: String, //cloudinary url
            required: true
        },

        title: {
            type: String, 
            required: true
        },

        description: {
            type: String, 
            required: true
        },

        duration: {
            type: Number, 
            required: true
        },

        views: {
            type: Number,
            default: 0
        },

        isPublished: {
            type: Boolean,
            default: true
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    }, 
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)       //^ Now we can write aggregate queries as well
//^ paases only required fields to next call

export const Video = mongoose.model("Video", videoSchema)