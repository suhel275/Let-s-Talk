const socket = io();// here we are getting [socket] object that allow us to send and receive request at client side

// Elements
// here [$] sign is for naming convension to know that this varible has element to select form DOM 

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');

const $sendLocationButton = document.querySelector('#send-location');

const $message = document.querySelector('#message');// here we are fetching the [container element] where we will put
// our [real chat text]

// Templates 

const messageTemplate = document.querySelector('#message-template').innerHTML;// here we are fetching the template
// it will give us the access to the element but we want [innerHtml] because it will have our [real chat text]

const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;// this is the template where I will put
// list of active users

// Options
const { username, room } = Qs.parse(location.search , { ignoreQueryPrefix: true})// here we are parsing our [query string]
// [location.serch] will give ["?username=suhel&room=family"] and [Qs.parse] will return object with properties
//[?username] and [room] so to remove [?] we will user [ignoreQueryPrefix: true]

/***************** these codes for [count project] to understand how [socket.io] works ***************************

socket.on('countUpdated', (count)=>{// here we are receiving the request sent by server and [event] name should be
    // same as in [server side] , from server we passed the value of [count] that will be receive here in callback
    // function and variables name is not importent in this callback function , order of variables are important 
    // because multiple variables can be received . Here [count] corrent value is received because if any other
    // client increase the [count] value then count increased value will come here . 
    // if server is countinue and you close the browser and again send request then it is not mendatory that [count=0]
    // [count] current value will come. if server is restarted and browser is continue then [count =0] will come
    console.log('count has been updated !', count);// it will print on every client browser console that is 
    // connected to the server
    // sometimes if browser console is showing connection error that is because [nodemon] restarts the server 
})

document.querySelector('#increment').addEventListener('click', ()=>{// here we are fetching the button that present
    // client browser and apply [click] event 
    console.log('clicked');// this line will print only to the client browser console where button is clicked
    socket.emit('increment');// here we are sending the request from this client to the server to increment the 
    // [count] value
})

**************************************************************************************************************/
const autoscroll = ()=>{
     // New Message Element
     const $newMessage = $message.lastElementChild;// this is the element where new message will be put

     // Height of the new message
     const newMessageHeightWithoutMargin = $newMessage.offsetHeight;// [offseHeight] gives the the height of the 
     // element but here [margin] is not included
     const newMessageStyles = getComputedStyle($newMessage);// [getComputedStyle] is a global function provided by the
     // browser , it will give all style properties that passing element has
     const newMessageMargin = parseInt(newMessageStyles.marginBottom);// [marginBottom] is a property that will
     // give how much margin this new element contains
     const NewMessageHeightWithMargin = newMessageHeightWithoutMargin + newMessageMargin ;// now we have height 
     // of new element with margin

     // Visible Height 
     const VisibleHeight = $message.offsetHeight;// this is the height that we can see on browser 
     
     // Height of messages container
     const containerHeight = $message.scrollHeight// [scrollHeight] will give the whole height in this newElement height
     // will also be included

     // how far have I scrolled ?

     const scrollOffset = $message.scrollTop + VisibleHeight;// [scrollTop] will give the height of the part that we can't 
     // see because this part is present above the screen that we can see that means if scroll is at the top , it will 
     // give 0 value
     // there is no property to get height from bottom so we are taking from the top
     // in  [scrollOffset] , the height will not be there that is present below the screen that we can see
     // that means if we are at the bottom then [scrollOffset] height will be equal to [containerHeight] 

     if(containerHeight - NewMessageHeightWithMargin <= scrollOffset ){// here we are checking that if we are at bottom
        // before coming new messsage then only will scroll down if we are above then we will not do scrolldown
         $message.scrollTop = $message.scrollHeight; // above we fatched value from [$message.scrollTop] but here we are
         // setting this value as whole height in this new element height will be included
         // if we don't want to apply this concept that if we are at bottom
        // before coming new messsage then only will scroll down if we are above then we will not do scrolldown
        // then we have to write only this line in (autoscroll) function
     }



}
socket.on('message', (message)=>{// [message] is an object that we passed from [index.js] file
   // console.log(message);
    const html = Mustache.render(messageTemplate,{
        username:message.username,// here we are passing [username] to [chat.html] file 
        message:message.text, // here we are passing [message] to [chat.html] file
        //createdAt:message.createdAt // / here we are passing the time that will be miliseconds from January 1st, 1970 at
        //midnight
        // createdAt:moment(message.createdAt).format() // [formate()] will give a bunch of informations some we don't
        // want also
        createdAt:moment(message.createdAt).format('h:mm a')// [moment] function is provided the [moment] library
        // that we loaded in [index.html] . 
        //['h:mm a'] this string is pattern of tokens in which we want time should be show on client browser
        // these tokens will be replace by [real values] when it will show on client browser
    });// [html] will contain final [template] that we want to render in the browser, [render] is the method of 
    // [mustache] to inject values inside, here we are replacing the value of {{message}} in template from 
    // [real chat text] , here we will pass [key-value] pain in object that will contain [same key name] as 
    // present in template , here we are using [short hand syntex]
    
    $message.insertAdjacentHTML('beforeend',html);// here we are putting our [real chat text] into container, but 
    // for location it will give entire URL , but we want clickable link , so we have to do some restructuring

    autoscroll();// if new message comes then there may be requirement of scrolling so we called this function here
})

socket.on('locationMessage',(url)=>{
    console.log(url);
    const html = Mustache.render(locationMessageTemplate,{
        username:url.username,
        url:url.location,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html);
    autoscroll();// if someone send the location then also there may be requirement of scrolling so we called this 
    // function here
})

socket.on('roomData', ({ room , users})=>{// this event will be send by [index.js] when any user [joined] or [left]
    // console.log(room);// here we are printing [room name] on client console to check that we got data or not 
    // console.log(users);// here we are printing [users of the room] on client console to check that we got data or not 

// Understand Process :- [ this is 2 steps process (1) create the template (2) render the template ]
// [sidebarTemplate] is a template because we have to put some dynamic data into html file so this template will use
// and by using [Mustache] library we will render dynamic data into template and we will get [html] that is normal
// html that we write and our dynamic data will be present in [html]
// now in one place of our [html file] we will put our [html] code , this place id is [sidebar]

    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html ;// here we are putting our [html] code into one place of 
    // [html file] which id is [sidebar].
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    // console.log('submit'); it was for checking purpose

    // disabled

    $messageFormButton.setAttribute('disabled','disabled');// [setAttribute] is used to set attribute on this element
    // here we are setting [disabled] attribure with [disabled] value so when [send] button is clicked then it will 
    // [disable] here

    // const message = document.querySelector('input');// here problem is if there are multiple [input tags]
    const message = e.target.elements.message.value ; // here [e.target] will give [form] and by [name] we can fetch 
    // any [form's element] , because by [tag name] like [input] there may be multiple elements so we will differentiat
    // by their name .

    /*****   here we we were practice for acknowledgement and from server
     side we were sending message that messege is delivered from server side as aknowledgement but we want [error]
     in place of [acknowlwdgement message] *************************************************************
    
     socket.emit('sendMessage',message, (message)=>{//
        console.log('message has been delivered !', message);
    })

    *********************************************************************************************************/
    

    socket.emit('sendMessage',message, (error)=>{// (error) this is callback function , this callback function will call
        // when event is aknowledged from server . 

        // enable

        $messageFormButton.removeAttribute('disabled');// here we are removing the [disabled] attribute so when we get
        // acnowledgement then client will able to send message again
        $messageFormInput.value = '';// after getting acknowledgement [input box] will be empty for next messaeg
        $messageFormInput.focus();// focus will be on [input box]
        if(error){// if [error] contains value that means there is some error
            return console.log(error);
        }
      //  console.log('message has been delivered !');// that means there is no error and aknowlwdgement is sent from server side
    })

})

$sendLocationButton.addEventListener('click',()=>{// whenever client click send location button then
    // this event will occure

    // disabled
    
    if(!navigator.geolocation){// not every browser support [geolocation] if client is using  old version and 
        // browser does not support [geolocation] then [navigation.geolocation] will not have any value
        return alert('Geolocation is not supported by your browser :(');
    }
    $sendLocationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{//[getCurrentPosition] is an asyncronous function so it may
        // take some time. [getCurrentPosition] does not support [promise] so we can't use [await]
        // [position] is an object that contains all informations that we want to share 

        //console.log(position);
        //console.log(position.coords.latitude);

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        socket.emit('sendLocation', { latitude,longitude}, ()=>{// here we are sending [latitude] and [longitude] of the 
            // current client location to the server.
         
            // enable
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location shared !');

        });




    })
})

socket.emit('join',{ username , room },(error )=>{// here we are sending the [join] event to server with [username and room]
       if(error){// if we get [error] as [acknowwledgement] from [index.js] file in this case 
           alert(error);// we will give this [error] alert ti the client 
           location.href = '/';// and we will redirect the client to the [root directory] that is [joining page of this project]
           // and '/' this show to root directory.
               }
})