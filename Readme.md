# My backend Youtube-twitter app

## Installing dependencies:
    npm --save-dev nodemon

    npm i -D prettier        //similar to "--save-dev" we can use "-D"
    --> Prettier: add .prettierrc file to store settings
                : add prettierignore ti not let prettier change them

    --> MongoDB Atlas: on the website create project and then create deployment on AWS to store data there.
    Things needed for MongoDB Atlas: Allow ip address, id-password

    npm i mongoose
    npm i express
    npm i dotenv

    npm i cookie-parser
    npm i cors

    npm i mongoose-aggregate-paginate-v2    // for using aggregate functions like count,limit,totalpages. 
    
    npm i jsonwebtoken      // To create tokens and encryption
    npm i bcrypt            // To hash passwords

    npm i cloudinary        // To store images/ videos/ files    
