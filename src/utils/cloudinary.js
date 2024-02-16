//&* We assume that there is a file on local storage and now we put it into the cloud storage.

//&* Also, as we have pushed the file to cloud, there is no need of that file in the local storage anymore.

import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"    //^ to manage, unlink (delete) files, nodejs provides acces through this.
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

//^ Ek method bnate hai, jisme path of file parameter mei pass hoga, and we will upload it on the cloud.
//^ Agr successfull rha, to local storage se unlink krdenge file ko

const uploadOnCloudinary =  async (localFilePath) => {
    try {
        if(!localFilePath)
            return null;
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        //file has been uploaded s
        console.log("file is uploaded on cloudinary");
        return response

    } 
    catch (error) {
        fs.unlink(localFilePath)    
                //^ remove the locally saved temporary file as upload operaation got failed 
        return null;
    }
}


export {uploadOnCloudinary}