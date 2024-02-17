import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([          //^ middleware injected
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]) ,
    registerUser        //* http:localhost:8000/api/v1/user/register
    )        


export default router