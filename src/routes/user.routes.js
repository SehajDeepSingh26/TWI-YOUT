import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changecurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getuserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    upload.fields([           //^ middleware injected
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser            //* http:localhost:8800/api/v1/users/register
    )
router.route("/login").post(loginUser)

//^ secured route
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changecurrentPassword)
router.route("/current-user").post(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getuserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router