const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next).catch(err => next(err)));
    }
}
//^ Promise.resolve() is used to wrap the result of calling requestHandler(req, res, next)
//^ If an error occurs within the requestHandler, it is caught using .catch(err => next(err)), where next(err) is used to pass the error to the Express error-handling middleware.

export {asyncHandler}





// const asyncHandler = async () => { }
// const asyncHandler = async (func) => { () => {} } 
                         //^ similar to above but parameter is func which is further expanded
// const asyncHandler = async (func) => () => {}       //^ Same as above

//^ Same function as above in try-catch Block
// const asyncHandler = async (func) => async(req, res, next) => {
//     try {
//         await func(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
