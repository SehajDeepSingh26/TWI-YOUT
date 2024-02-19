import connectDB from"./db/index.js"
import { app } from "./app.js"
// const app = express()
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8800, ()=>{
        console.log(`⚙️  Server is running at ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB Connection FAILED !!: ", err)
    throw err
})


/*
import express from "express"
const app = express()


    &  function connectDB(){
    &  }
    &  connectDB()

( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
                    ^ we use async-await as DB may take some time to load the data. 
        app.on("errror", (error) =>{
            console.log("Error: ", error);
            throw error;
        })

        app.listen(process.env.PORT, () => { 
            console.log(`App is listening on ${process.env.PORT}`)
        })
    }   
    catch(error){
        console.log("Error: ", error)
    }
})()
*/