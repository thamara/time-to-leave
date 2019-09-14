document.addEventListener('DOMContentLoaded', function () {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.');
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
});

function notifyUser() {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('Time to leave', {
        icon: 'assets/timer.png',
        body: "Hey there! I think it's time to leave."
    });

    notification.onclose = function(){
    }
  }
}