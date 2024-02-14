class ApiError extends Error{
    constructor(
        message="Something went Wrong",
        statusCode,
        errors=[],      //^ for list of errors
        statck=""       //^ this is to store the error codes
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(statck){
            this.stack = statck
        }
        else{
            Error.captureStackTrace(this, this.constructor) 
        }
    }
}

export {ApiError}