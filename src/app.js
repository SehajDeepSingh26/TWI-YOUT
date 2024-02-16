import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({      //^ to accept and forward data from frontend to backend
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//^ To limit the the incoming data of type json from Forms
app.use( express.json({ limit: "16kb" }) )    

//^ To limit the the incoming data from URLs
app.use( express.urlencoded({ extended: true, limit: "16kb" }) )

//^ To store any image, favicons, document in a public folder 
app.use( express.static( "public" ) )

app.use(cookieParser());

import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/user", userRouter)    //^ when client goes to /users, we give control to UserRouter.js file to do task
                                //* https:localhost:8080/users
//^ we cannot use app.get directly here, because we are writing routes in different place.



export { app }