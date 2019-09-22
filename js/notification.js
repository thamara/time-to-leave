const notifier = require('node-notifier');
const path = require('path');

/**
 * Notify user it's time to leave.
 */
function notifyUser() {
    notifier.notify(
        {
          title: 'Time to leave',
          message: 'Hey there! I think it\'s time to leave.',
          icon: path.join(__dirname, 'assets/timer.png'), // Absolute path (doesn't work on balloons)
          sound: true, // Only Notification Center or Windows Toasters
          wait: true // Wait with callback, until user action is taken against notification
        },
        function(err, response) {
          // Response is response from notification
        }
      );
       
      notifier.on('click', function(notifierObject, options, event) {
        // Triggers if `wait: true` and user clicks notification
      });
       
      notifier.on('timeout', function(notifierObject, options) {
        // Triggers if `wait: true` and notification closes
      });
}

module.exports = {
    notifyUser
};