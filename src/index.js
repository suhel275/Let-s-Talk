
const express = require('express');// here are importing [express]
const path = require('path');// [path] is a core module of node.js so no requirement to install it.
const http = require('http');// here we are importing [http] core module
const socketio = require('socket.io');// here we are importing [socket.io] library , it will alllow us to set uo [express]
// by a slitly defferent way. Here we are getting [socketio] , it is a function , by using this we will create instance
// of [socket.io] .
// [without socket] only client send request and server reply but server can't request so one client can't communicate 
// to others
// [with socket] client and server both can request and both can reply so server will send one client message to 
// other client and communication will occure .
const Filter = require('bad-words');// this package is imported to filter [impour] words
const {generateMessage , generateLocationMessage} = require('./utils/messages');// here we are importing the function to generate the object that we
// want to send on user client
const { addUser , removeUser , getUser , getUsersInRoom} = require('./utils/users');// by using these functions we 
// will be able to track that which user is in which room 
const app = express();// here we are creating [express application]
const server = http.createServer(app);// in place of [server] , we can take any name as a variable . [createServer]
// allow us to create a new [webserver] outside the express library and we will pass an express application to it to use 
// express application by this server
// if  we don't do this then express library will do behind the scene ,but we will not be able to user [server] according
// our requirement in that case . So here we are doing [refactoring]
// by doing all these [refactoring] , it will be easy to use [socket.io]
const io = socketio(server);// here we are creating the instance of [socket.io] to work with our web server
// if [server] is created by [express] then we will not be able to pass this server to the [socketio function]
// But by doing [refactoring ] , we can pass [http server] to [socketio function] .
// now our server support web socket .

const port = process.env.PORT || 3000 ;

const publicDirectoryPath = path.join(__dirname,'../public');// here we are giving the path to reach from here to the 
//[public] directory where our some html files are present
app.use(express.static(publicDirectoryPath));// here we are saying to run [public directory] file by default when current
// file is run

/***************** these codes for [count project] to understand how [socket.io] works ***************************

// here we are creating small scenario , to communicate server and different clients.

// server(emit) -> client(receive) ->countUpdated  [that means if server send the request then client will receive 
// and event will be countUpdate]
// client(emit) -> server(emit) -> increment  [that means if client send the request then server will receive 
// and event will be increment]
let count = 0 ;// [count] should be [let] because in future we have to change the value of [count]

io.on('connection',(socket)=>{// here we are receiving the event that is [connection] this event will occure whenever
    // any connection is done with this socketio . in callback function we passed [socket] object , that contains 
    // informations about new connection
    // [socket] object allow us to send and receive the requeset at [server side] and [client side]
    // if there are 5 connection then all codes that are present in this callback function will run 5 times

    console.log('New WebSocket Connection');// this line will run whenever ever any connection is done and any connect
    // send the request , if there are 5 connection then this line will run 5 times 

    socket.emit('countUpdated' , count);// [emit] means we are sending the request . here we are sending the [countUpdated]
    // event this event will be to the connection that request , and it will send the [count] value that is present that 
    // time 
    // here we did not use [io.emit] because if any client is connected then everyclient will have some info that we want
    // a client should have when he connected. but in [socket.emit] only recently connected client will have this info

    socket.on('increment',()=>{ // here we are receiving request sent by the client and [event] name should be same as
        // [client side] 
        count++;// here we are increasing the count value

        // socket.emit('countUpdated', count); // here again we are sending the request to the client with [count] updated
        // value but this time this request will go to only the client that sent the request to increment not other
        // clients but if we refresh the other clients then they clients will have [count] updated value but without refreshing
        // other clients will not have the [countUpdated] value 

        io.emit('countUpdated', count);// here every client that is connected to the server will have count updated value without
        // refreshing .
    })

})

*************************************************************************************************************/

/******************** we were using this when we were not using [http server] **********************************

app.listen(port,()=>{
    console.log(`server is up on port ${port}`);
})

*/


io.on('connection' , (socket)=>{ // Remember [connection] and 
    // [disconnect] events are [socket.io] library events so no required to generate these 2 events we have to listen 
    // these events .
    // [io.on] is used only for [connection] event

   // console.log('new client is connected'); // this messsage will print when any client is connected

    // socket.emit('message', 'Welcome !'); // we want to send [message time] also that's why  we commented this

    // [socket.emit()] => it is used when we are refering to single client that means here current client will get this message

    // [socket.broadcast.emit()] => here every client will get the message except current [socket] that means current client 

    // [io.emit()] => here every client will get the message who is conneted

    

    //socket.on('join',({ username, room},callback)=>{// this event is sent from [chat.js]
    // here we are getting [username , room] form [chat.js]
     // const {error, user} = addUser({id:socket.id,username,room}); // [socket.id] is a unique id that is provided
     // by the [socket] for particular connection
        socket.on('join',(options,callback)=>{  // here also doing the same thing as above in comment but here [options]
            // is an object that contains [username and room]
      
        const {error, user} = addUser({id:socket.id, ...options});// here also doing the same thing as above in comment but here
        // we are doing [structuring] that means we are merging [options] object propertes with [socket.id] in one object 
        // and that object will be passed to [addUser] function
        // if error occure then [error] will have the value , otherwise [user] will have the value from [addUser] function
        // in destructuring {error, user} , remember here we have to use same name that we are returning from [addUser]
        // function as [error and user] . we are returning objects from [addUser] function and these [error and user] are
        // properties of these returning objects

        if(error){
        return callback(error);// if error occure then we will send this error to [chat.js] file as acknowledgement 
        // and [chat.js] will redirect user to [joining page] , and remaining code will not run of this file
        }
        socket.join(user.room);// [socket.join] allow us to join given room
        // remember one thing that [addUser] and other functions of [users.js] file is for tracking purpose, actual join is
        // done her [socket.join]

        socket.emit('message', generateMessage('Admin','Welcome !'));// here we are passing object that [chat.js] file will listen
        // [generateMessage] function is present in [messages.js] file that do some oprations and return an object with
        // all required data that we want to show on client browser . so this object will be sent to [chat.js] file.
        // [generateMessage] function will take argument (1) name that who sent the message (2) what is the message

        socket.broadcast.to(user.room).emit('message',generateMessage('Admin' , `${user.username} has joined !`));// when ever new client is join then remain client will 
        // get message that new client is connected because whenever any client is connected then [io.on('connection')] event
        // call and [welcome] message is sent to the current [socket] and [broadcast] message is sent to the remain [clients]
        // here we are passing object that [chat.js] file will listen
        // [to] is a function that allow us emit the event in a particular room , here we are using [to with broadcast]
        // so event will not emit to current socket
        // [generateMessage] function is present in [messages.js] file that do some oprations and return an object with
        // all required data that we want to show on client browser . so this object will be sent to [chat.js] file.
        // [generateMessage] function will take argument (1) name that who sent the message (2) what is the message
        
        io.to(user.room).emit('roomData' , {// when a user is joined then [room-list] will change so here we are 
            // sending event to [chat.js] with [room name] and [users] in this room where user joined . 
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback();// here we are sending the acknowledge to [chat.js] after event is executed successfully , actually 
        // we are not passing any error in the [callback] function so [chat.js] will do nothing after getting acknowledgement
    })
    socket.on('sendMessage',(message, callback)=>{// here we are having [callback] function also with message, this 
        // callback function is called to acknowledge the event from server side
        // console.log(message); //it was for checking purpose .
        const user = getUser(socket.id);
        const filter = new Filter();// here we are creating the object of [bad-words] package
        if(filter.isProfane(message)){// [isProfane] method will give true if these is [impour] words in the [message]
            return callback('profanity is not allowed ');
        }
       // io.to('Family').emit('message' , generateMessage(message));// here we are passing object that [chat.js] file will listen
       // callback('delivered');
       // here we are using [to with io] so it will emit event to every socket if this room [Family] .
       io.to(user.room).emit('message' , generateMessage(user.username , message));
       // [generateMessage] function is present in [messages.js] file that do some oprations and return an object with
        // all required data that we want to show on client browser . so this object will be sent to [chat.js] file.
        // [generateMessage] function will take argument (1) name that who sent the message (2) what is the message
        // when a [message] or [location] is sent then server fetch the [user] form [users array] that present in [users.js]
        // file related to the [socket.id] then see in which room user is related and send the [message] or [location] in
        // that room 
       callback();// by calling this callbackback function we are aknowledging the event from server side .
    })

    socket.on('disconnect',()=>{// this event will cal when a client close his browser and remember [connection] and 
        // [disconnect] events are [socket.io] library events so no required to generate these 2 events we have to listen 
        // these events .
          
        const user = removeUser(socket.id);// if this user is present in [users] array in [users.js] file then [user]
        // will have object otherwise it will have undefined .

        if(user){
        io.to(user.room).emit('message', generateMessage('Admin' , `${user.username} has left !`)) // this message will get remains clients that a user is exit. you may confuse
        // that we should use [socket.broadcast] here because by using [io] current client will also get this message but
        // current client is disconnected so this client will not get this message . Only connected clients will get this
        // message by [io]
        // here we are passing object that [chat.js] file will listen
        // there may be a scenario that a client send a request to join the room and it failed and we closed the browser
        // in this case we don't want to send the message to the room member that this client is left so we put this 
        // [io.emit] in [if] condition
        // remember one thing also here we used [user.room] and [user.username] but this event don't have [username] and
        // [room] only [join] event has [username] and [room] . it is possible because of [users] array in [users.js] file
        // from [join] event we will save all users' [id,username,room] in [users] array and then can use in any events
        // by using [functions] of [users.js] file
        // [generateMessage] function is present in [messages.js] file that do some oprations and return an object with
        // all required data that we want to show on client browser . so this object will be sent to [chat.js] file.
        // [generateMessage] function will take argument (1) name that who sent the message (2) what is the message

        io.to(user.room).emit('roomData' , {// when a user left then [room-list] will change so here we are 
            // sending event to [chat.js] with [room name] and [users] in this room from where user left. 
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        }

        
        
    })

    socket.on('sendLocation', (coords, callback)=>{
      const user = getUser(socket.id);
        // io.emit('message',`location : ${coords.latitude} , ${coords.longitude}`);// here we are sending [latitude]
        // and [longitude] to every connected client
        //io.emit('message',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`);// here we are sending 
        // a [google map link] to every connected client depending on latitude and longitude

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        // [generateLocationMessage] function is present in [messages.js] file that do some oprations and return an object with
        // all required data that we want to show on client browser . so this object will be sent to [chat.js] file.
        // [generateLocationMessage] function will take argument (1) name who sent the location (2) URL of the location
        // when a [message] or [location] is sent then server fetch the [user] form [users array] that present in [users.js]
        // file related to the [socket.id] then see in which room user is related and send the [message] or [location] in
        // that room 
        callback();
    })
    
})
server.listen(port,()=>{//  [server.listen] is used to start our [http server]
    console.log(`server is up on port ${port} !`);
})