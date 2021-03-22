const socket = io()
const msgs = []
const onlineUsers = []
let typing = []
let username = prompt("User?", "anonymous")

let amityping = false;

function typed() {
	if (!amityping) {
		amityping = true;
		socket.emit("typing", typing)
	}
}

socket.emit("user joined", username)

socket.emit("update users", username)

socket.on("update users", data => {
  if (onlineUsers.includes(data)) return;
  onlineUsers.push(data)
  document.getElementById("onlineUsers").innerHTML = "Length: " + onlineUsers.length + "<br>Users:<br>" + onlineUsers.join("<br>")
})

socket.on("user left", data => {
  msgs.push(data)
  document.getElementById("messages").innerHTML = msgs.join("<br>")
  while (onlineUsers.length) {
    onlineUsers.pop()
  }
  socket.emit('update users', username)
})

socket.on("user joined", data => {
  msgs.push(data)
  document.getElementById("messages").innerHTML = msgs.join("<br>")
})

socket.on("msg", data => {
	typing = []
  msgs.push(data)
  document.getElementById("messages").innerHTML = msgs.join("<br>")
  for (let onlUsers of onlineUsers) {
    if (data.includes("@" + onlUsers)) { 
      if (!username.includes(onlineUsers.filter(user => user.startsWith(onlUsers)))) return;
		  notif()
	  } else if (data.includes("@everyone")) { 
		  notif()
	  }
  }
	$("body").scrollTop = $("body").scrollHeight
})
// jQuery uses query selectors
// jQuery also stands for javascriptQuery
socket.on("kick", user => {

})

socket.on("ban", user => {

})

socket.on("typing", user => {
	typing.push(user)
	document.getElementById("istyping").innerHTML = typing.join(", ") + " is ".repeat(typing.length==1) + " are ".repeat(typing.length!=1) + " typing...";
})

function send() {
  socket.emit('msg', document.getElementById("msg").value, username)
  document.getElementById("msg").value = "";
	amityping = false;
	delete typing[typing.indexOf(username)]
}

function notif() {
	(async () => {
    // create and show the notification
    const showNotification = () => {
      // create a new notification
      const notification = new Notification('Ping', {
        body: 'Someone pinged you!',
      });

      // close the notification after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10 * 1000);

      // navigate to a URL when clicked
      notification.addEventListener('click', () => {
        window.open('https://NSItemsChat.nyokosatouhsato.repl.co', '_blank');
      });
    }

    // show an error message
    const showError = () => {
      const error = document.querySelector('.error');
      error.style.display = 'block';
      error.textContent = 'You blocked the notifications';
    }

    // check notification permission
    let granted = false;

    if (Notification.permission === 'granted') {
      granted = true;
    } else if (Notification.permission !== 'denied') {
      let permission = await Notification.requestPermission();
      granted = permission === 'granted' ? true : false;
    }
    granted ? showNotification("test") : showError();
	})();
}