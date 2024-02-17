//^ https://github.com/expressjs/multer

import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/public/temp')
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + 
    //                         Math.round(Math.random() * 1E9)   //^ to rename the file
    //     console.log(file)
    //   cb(null, file.fieldname + '-' + uniqueSuffix)
        cb(null, file.originalname)
    }
  })
  
  const upload = multer({ 
    storage: storage
  })

  export {upload}