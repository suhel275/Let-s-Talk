// this file is created to improve [reusability] because we have to send [message] and [timestamp]  or 
// [location] and [timestamp] on many places
// so instead of create object in on place just call below functions 

const generateMessage = (username ,text)=>{// this function is created to generate an object that will have [username] ,[message] and 
    // [timestamp] of the message that means when this message is created and we will send these on client browser
     // we created function to generate this object because in many places we have to generate this object according the
     // message we want to send so in [text] this is the message that we want to send 
    return {
        username,
        text,
        createdAt: new Date().getTime()// here we are generating [timestamp] by using buildin javascript functionality
        // here we are passing the time that will be miliseconds from January 1st, 1970 at
        // midnight
        // we are getting this time from the server

    }
}

const generateLocationMessage = (username , location)=>{
    return {
      username,
      location,
      createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}