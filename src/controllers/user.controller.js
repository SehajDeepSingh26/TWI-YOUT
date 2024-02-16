import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req, res ) => {
    res.status(200).json({
        message: "ok"
    })
    console.log("in user controlller")
} )

export { registerUser }