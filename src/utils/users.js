// In this file we will create all these functions
// addUse , removeUser , getUser , getUsersInRoom
// final motive of this file is to track which user is in which room because when we send a message so we can identify


const users = []// in this array all clients will be present that may contain same room or they may contain different
// room
// remember one thing ,from [join] event we will save all users' [id,username,room] in [users] array and then can use in any events
        // by using [functions] of [users.js] file



const addUser = ({id , username , room})=>{// when any client connect with [socket.io] then socket.io give an [unique id]
// to every client 
    // clean the data
    username = username.trim().toLowerCase();// [trim()] is used to remove the extra spaces
    room = room.trim().toLowerCase();

    // validate the data
    if(!username || !room){// that means[username] and [room] both should have value
        return {
            error:'Username and room are required'
        }
    }

    // check for existingUser
    const existingUser = users.find((user)=>{// that means in same room , 2 users with same name can't exist but in 
    // different room users with same name can exist
        return user.room === room && user.username === username ;
    })

    // validate usename 
    if(existingUser){
        return {
            error:'username is in use'
        }
    }

    // store user
    const user = { id , username , room};
    users.push(user);// here we are putting current user into [users] array
    return {user};// it will return an object that contains [user] as property of this object and inside this property
    // all user's property will present like [id,username,room]
}

const removeUser = (id)=>{
     const index = users.findIndex((user)=> user.id === id);// here we will get the position of the element
     // if we use [filter] in place of [findIndex] then job will be done but filter will take more time because 
     // it will check till the end of the array. after matching in middle also , it will not stop. But [findIndex] if
     // it matches then it will stop
     if(index!==-1){
       return users.splice(index,1)[0];// slice allow us to remove the elements form the given index and 2nd argument
       // will be how many elements you want to remove
       // splice methods return array so by using this logic [0] we will get object of one item that contains properties as
       // [id, username,room]
     }
}

/*************** It will run successfully ****************************************************************** *
const user = addUser({
    id:33,
    username:'Suhel',
    room:'family'
})

console.log(users);
console.log(user);

*************************************************************************************************************** */

/**************************     it will give error message  *************************
const res1 = addUser({
    id:23,
    username:'',
    room:''
})

console.log(res1);
****************************************************************************************************** */

/************************* it will give no error message ************************************************
const res2 = addUser({
    id:23,
    username:'SuHeL',
    room:'jk'
})

console.log(res2);
*************************************************************************************************************** */

/***************** it will give error message ******************************************************************* *
const res3 = addUser({
    id:23,
    username:'SuHeL',
    room:'FaMIly'
})

console.log(res3);

********************************************************************************************************** */

/***************************************************************it will give no error message ***************** *
const removedUser = removeUser(23);
console.log(removedUser);
console.log(users);
********************************************************************************************************* */
/*************** it was for testing purpose ******************************************************************
addUser({
    id:43,
    username:'Faizad',
    room:'family'
})


addUser({
    id:53,
    username:'Arshad',
    room:'friend'
})

console.log(users);// here it will contains 3 users objects

***********************************************************************************************************/

const getUser = (id)=>{// this function will give the user object which userid is passed
    return users.find((user)=> user.id === id);
}

/******************** it was for testing purpose  **********************************************************

const fetchedUser1 = getUser(43);// here it will return the object that has [id=43]
console.log(fetchedUser1);

const fetchedUser2 = getUser(100);// here it will return [undefined] because [id=100] does not exist in [users] array
console.log(fetchedUser2);

**************************************************************************************************************/

const getUsersInRoom = (room)=>{// this function will return the array that will have user objects related to the room
    // that is passes
    room = room.trim().toLowerCase();
    return users.filter((user)=> user.room === room);// [filter] returns [array of elements] that satisfy the condition
}

/*********************** It was for testing purpose ***********************************************************
 
const usersInRoom = getUsersInRoom('family');
console.log(usersInRoom);

***************************************************************************************************************/

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}