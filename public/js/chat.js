const socket = io();
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');

const $sendLocationButton = document.querySelector('#send-location');

const $message = document.querySelector('#message');

// Templates

const messageTemplate = document.querySelector('#message-template').innerHTML;

const locationMessageTemplate = document.querySelector(
  '#location-message-template'
).innerHTML;

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});
const autoscroll = () => {
  // New Message Element
  const $newMessage = $message.lastElementChild;

  // Height of the new message
  const newMessageHeightWithoutMargin = $newMessage.offsetHeight;
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const NewMessageHeightWithMargin =
    newMessageHeightWithoutMargin + newMessageMargin;

  // Visible Height
  const VisibleHeight = $message.offsetHeight;

  // Height of messages container
  const containerHeight = $message.scrollHeight;

  // how far have I scrolled ?

  const scrollOffset = $message.scrollTop + VisibleHeight;

  if (containerHeight - NewMessageHeightWithMargin <= scrollOffset) {
    $message.scrollTop = $message.scrollHeight;
  }
};
socket.on('message', message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  });

  $message.insertAdjacentHTML('beforeend', html);

  autoscroll();
});

socket.on('locationMessage', url => {
  const html = Mustache.render(locationMessageTemplate, {
    username: url.username,
    url: url.location,
    createdAt: moment(url.createdAt).format('h:mm a')
  });
  $message.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });

  document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', e => {
  e.preventDefault();

  // disabled

  $messageFormButton.setAttribute('disabled', 'disabled');
  const message = e.target.elements.message.value;
  socket.emit('sendMessage', message, error => {
    // enable

    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
  });
});

$sendLocationButton.addEventListener('click', () => {
  // disabled

  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser :(');
  }
  $sendLocationButton.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition(position => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    socket.emit('sendLocation', { latitude, longitude }, () => {
      // enable
      $sendLocationButton.removeAttribute('disabled');
    });
  });
});

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
