const { getUserPreferences, showDay } = require('../js/UserPreferences.js');
const { validateTime } = require('../js/time_math.js');
const Store = require('electron-store');

const store = new Store({name: 'waived-workdays'});

// Global values
let usersStyles =  getUserPreferences();

function setToday () {
    var today = new Date();
    document.getElementById('date').value = today.toISOString().substr(0, 10);
}

function setHours() {
    document.getElementById('hours').value = usersStyles['hours-per-day'];
}

function toggleAddButton() {
    var value = document.getElementById('reason').value;
    if(value.length > 0){
        $('#waive-button').removeAttr('disabled');
    } 
    else {
        $('#waive-button').attr('disabled', 'disabled');
    }
}

function addRowToListTable(day, reason, hours) {
    var table = document.getElementById('waiver-list-table'),
        row = table.insertRow(1),
        dayCell = row.insertCell(0),
        reasonCell = row.insertCell(1),
        hoursCell = row.insertCell(2),
        delButtonCell = row.insertCell(3);
  
    dayCell.innerHTML = day;
    reasonCell.innerHTML = reason;
    hoursCell.innerHTML = hours;
    var id = 'delete-' + day;
    delButtonCell.innerHTML = '<input class="delete-btn" id="' + id + '" type="image" src="../assets/delete.svg" alt="Delete entry" height="12" width="12"></input>';
    
    $('#'+ id).on('click', function() {
        deleteEntry(this.id.replace('delete-', ''));
    });
}

function populateList() {
    for (const elem of store) {
        var date = elem[0],
            reason = elem[1]['reason'],
            hours = elem[1]['hours'];
        addRowToListTable(date, reason, hours);
    }
}

function addWaiver() {
    var date = document.getElementById('date').value,
        reason = document.getElementById('reason').value,
        hours = document.getElementById('hours').value;

    if (!(validateTime(hours))) {
        // The error is shown in the page, no need to handle it here
        return;
    }

    if (store.has(date)) {
        alert('You already have a waiver on this day. Remove it before adding a new one.');
        return;
    }

    var [year, month, day] = date.split('-');
    if (!showDay(year, month - 1, day)) {
        alert('This is not a working day.');
        return;
    }

    store.set(date, { 'reason' : reason, 'hours' : hours });
    addRowToListTable(date, reason, hours);

    //Cleanup
    document.getElementById('reason').value = '';
}

function deleteEntry(day) {
    if (!confirm('Are you sure you want to delete waiver on day ' + day + '?')) {
        return;
    }
    store.delete(day);
    var table = document.getElementById('waiver-list-table');
    while(table.rows.length > 1) {
        table.deleteRow(1);
    }
    populateList();
}

$(() => {
    setToday();
    setHours();
    toggleAddButton();

    populateList();

    $('#reason').on('keyup', function() {
        toggleAddButton();
    });

    $('#waive-button').on('click', function() {
        addWaiver();
    });
});