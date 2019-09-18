/**
 * Notify user it's time to leave.
 */
function notifyUser() {
    if (Notification.permission !== 'granted')
        Notification.requestPermission();
    else {
        var notification = new Notification('Time to leave', {
            icon: 'assets/timer.png',
            body: 'Hey there! I think it\'s time to leave.'
        });

        notification.onclose = function(){
        };
    }
}

module.exports = {
    notifyUser
};