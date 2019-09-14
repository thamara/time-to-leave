const Store = require('electron-store');
const store = new Store();

var calendar = null;

/**
 * Formats a given amount of minutes into string HH:MM
 */
function minutesToHourFormated(min) {
	if (min < 0) {
		return "--:--"
	}
	var hours = Math.floor(min / 60)
	var minutes = Math.floor(min - (hours * 60))
	return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes
}

/**
 * Subtracts time first from second (t2 - t1)
 * Time should be formated as HH:MM
 */
function subtractTime(t1, t2) {
	var st1 = t1.split(':')
	var st2 = t2.split(':')
	var d1 = new Date(2019, 1, 1, st1[0], st1[1], 0, 0)
	var d2 = new Date(2019, 1, 1, st2[0], st2[1], 0, 0)
    var diffMin = (d2 - d1)/1000/60
    return minutesToHourFormated(diffMin)
}

/**
 * Sums time first to second (t1 + t2)
 * Time should be formated as HH:MM
 */
function sumTime(t1, t2) {
	var st1 = t1.split(':')
	var st2 = t2.split(':')
    var totalMin = Number(st1[1]) + (Number(st1[0]) * 60) + Number(st2[1]) + (Number(st2[0]) * 60)
    return minutesToHourFormated(totalMin)
}

/**
 * Validates that a string is a valid time, following the format of HH:MM
 * @returns true if it's valid
 */
function validateTime(time) {
	var re = new RegExp('[0-2][0-9]:[0-5][0-9]')
	return re.test(time)
}

/*
 * Returns true if we should display day. 
 * Saturdays and Sundays are not displayed.
 */
function showDay(year, month, day)  {
	var currentDay = new Date(year, month, day), weekDay = currentDay.getDay()
	return weekDay != 0 && weekDay != 6;
}

/*
 * Display next month of the calendar.
 */
function nextMonth() {
	calendar.nextMonth();
}

/*
 * Display previous month of the calendar.
 */
function prevMonth() {
	calendar.prevMonth();
}

/*
 * Display the current month on the calendar.
 */
function goToCurrentDate() {
	calendar.goToCurrentDate();
}

//Helds the calendar information and manipulation functions
class Calendar {
	options = {
		weeks : [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
		weekabbrs : [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
		months : [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
		monthabbrs : [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
	}

	constructor() {
		this.today = new Date();
		this.month = this.today.getMonth();
		this.year = this.today.getFullYear();
		this._initCalendar(this.month, this.year)
	}

	/*
	 * Display next month.
	 */
	nextMonth() {
		if (this.month == 11) {
			this.month = 0
			this.year += 1
		} else {
			this.month += 1
		}
		this._initCalendar(this.month, this.year)
	}

	/*
	 * Display previous month.
	 */
	prevMonth() {
		if (this.month == 0) {
			this.month = 11
			this.year -= 1
		} else {
			this.month -= 1
		}
		this._initCalendar(this.month, this.year)
	}

	/*
	 * Go to current month.
	 */
	goToCurrentDate() {
		this.month = this.today.getMonth();
		this.year = this.today.getFullYear();
		this._initCalendar(this.month, this.year)
	}

	/*
	 * Display calendar defined.
	 */
	_initCalendar(month, year) {
		this._generateTemplate();
		this.updateBasedOnDB();
		this.updateLeaveBy();
		$("input[type='time']").on('input propertychange', function() {
			if (validateTime(this.value)) {
				updateTimeDayCallback(this.id)
			}
		});
		$('#next-month').on('click', function() {
			nextMonth();
		});
	
		$('#prev-month').on('click', function() {
			prevMonth();
		});

		$('#current-month').on('click', function() {
			goToCurrentDate();
		});
	}

	/*
	 * Gets year of displayed calendar.
	 */
	getYear() {
		return this.year
	}

	/*
	 * Gets month of displayed calendar.
	 */
	getMonth() {
		return this.month
	}

	/*
	 * Gets month length of displayed calendar.
	 */
	getMonthLengh() {
		var d = new Date(this.year, this.month, 0)
		return d.getDate()
	}

	/*
	 * Updates data displayed based on the database.
	 */
	_setData(key) {
		if (store.has(key)) {
			document.getElementById(key).value = store.get(key)
		} else {
			document.getElementById(key).value = ""
		}
	}

	/*
	 * Updates data displayed based on the database.
	 */
	updateBasedOnDB() {
		var d = new Date(this.year, this.month, 0), monthLength = d.getDate()
		for (var day = 1; day <= monthLength; ++day) {
			if (!showDay(this.year, this.month, day)) {
				continue;
			}
			var dayStr = this.year + '-' + this.month + '-' + day + '-';
			this._setData(dayStr + 'lunch-begin')
			this._setData(dayStr + 'lunch-end')
			this._setData(dayStr + 'lunch-total')
			this._setData(dayStr + 'day-begin')
			this._setData(dayStr + 'day-end')
			this._setData(dayStr + 'day-total')
		}
		this.updateLeaveBy()
	}

	/*
	 * Update field time to leave
	 */
	updateLeaveBy() {
		if (!showDay(this.today.getFullYear(), this.today.getMonth(), this.today.getDate()) ||
			this.today.getMonth() != this.getMonth() || 
			this.today.getFullYear() != this.getYear()) {
			return
		}
		var dayKey = this.today.getFullYear() + '-' + this.today.getMonth() + '-' + this.today.getDate() + '-';
		var dayBegin = document.getElementById(dayKey + 'day-begin').value
		if (validateTime(dayBegin)) {
			var leaveBy = sumTime(dayBegin, "08:00")
			var lunchTotal = document.getElementById(dayKey + 'lunch-total').value
			if (lunchTotal) {
				leaveBy = sumTime(leaveBy, lunchTotal)
			}
			document.getElementById('leave-by').value = leaveBy
		}
	}

	/*
	 * Generates the calendar HTML view
	 */
	 _generateTemplate() {
		var body = this._getBody()
		document.getElementById('calendar').innerHTML = body
	}

	/*
	 * Returns the time input html code of a date
	 */
	static _getInputCode (year, month, day, type) {
		return '<input type="time" id="' + 
			   year + '-' + month + '-' + day + '-' + type + 
			   '"' +
			   (type.endsWith('total') ? ' disabled' : '') +
			   '>'
	}

	/*
	 * Returns the total field html code of a date
	 */
	static _getTotalCode (year, month, day, type) {
		return '<input type="text" class="total-input" id="' + 
			   year + '-' + month + '-' + day + '-' + type + 
			   '" size="5"' +
			   (type.endsWith('total') ? ' disabled' : '') +
			   '>'
	}

	/*
	 * Returns the summary field html code
	 */
	static _getSummaryRowCode () {
		var leaveByCode = '<input type="text" id="leave-by" size="5" disabled>'
		var summaryStr = 'Based on the time you arrived today, you should leave by'
		var code = '<tr class="summary">' +
					 '<td class="leave-by-text" colspan="7">' + summaryStr + '</td>' +
				     '<td class="leave-by-time">' + leaveByCode + '</td>' +
				   '</tr>'
		return code
	}

	/*
	 * Returns the code of a calendar row
	 */
	_getInputsRowCode (year, month, day) {
		var currentDay = new Date(year, month, day),
			weekDay = currentDay.getDay(),
			today = new Date(),
			isToday = (today.getDate() == day && today.getMonth() == month && today.getFullYear() == year)	

		if (!showDay(year, month, day)) {
			return  '<tr'+ (isToday ? ' class="isToday"' : '') + '>' +
					'<td class="weekday ti">' + this.options.weekabbrs[weekDay] + '</td>' +
					'<td class="day ti">' + day + '</td>' +
					'<td class="day non-working-day" colspan="6">' + '</td>' +
				'</tr>\n'
		}	

		var htmlCode = 
				 '<tr'+ (isToday ? ' class="isToday"' : '') + '>' +
					'<td class="weekday ti">' + this.options.weekabbrs[weekDay] + '</td>' +
					'<td class="day ti">' + day + '</td>' +
					'<td class="ti">' + Calendar._getInputCode(year, month, day, 'day-begin') + '</td>' +
					'<td class="ti">' + Calendar._getInputCode(year, month, day, 'lunch-begin') + '</td>' +
					'<td class="ti ti-total">' + Calendar._getTotalCode(year, month, day, 'lunch-total') + '</td>' +
					'<td class="ti">' + Calendar._getInputCode(year, month, day, 'lunch-end') + '</td>' +
					'<td class="ti">' + Calendar._getInputCode(year, month, day, 'day-end') + '</td>' +
					'<td class="ti ti-total">' + Calendar._getTotalCode(year, month, day, 'day-total') + '</td>' +
				'</tr>\n'

		if (isToday) {
			htmlCode += Calendar._getSummaryRowCode()
		}

		return htmlCode
	}

	/*
	 * Returns the header of the page, with the image, name and a message.
	 */
	_getPageHeader (year, month) {
		var todayBut = '<input id="current-month" type="image" src="assets/calendar.svg" alt="Current Month" height="24" width="24"></input>'
		var leftBut = '<input id="prev-month" type="image" src="assets/left-arrow.svg" alt="Previous Month" height="24" width="24"></input>'
		var ritghBut = '<input id="next-month" type="image" src="assets/right-arrow.svg" alt="Next Month" height="24" width="24"></input>'
		return '<div class="title-header">'+
					'<div class="title-header title-header-img"><img src="assets/timer.svg" height="64" width="64"></div>' +
					'<div class="title-header title-header-text">Time To Leave</div>' +
					'<div class="title-header title-header-msg"></div>' +
		       '</div>' + 
		        '<table class="table-header"><tr>' +
					'<th class="th but-left">' + leftBut + '</th>' +
					'<th class="th th-month-name" colspan="18"><div class="div-th-month-name">' + this.options.months[month] + ' ' + year + '</div></th>' +
					'<th class="th but-right">' + ritghBut + '</th>' +
					'<th class="th but-today">' + todayBut + '</th>' +
				'</tr></table>'
	}

	/*
	 * Returns the code of the header of the calendar table
	 */
	_getTableHeaderCode (year, month) {
		return '<tr>' +
				'<tr>' +
					'<td class="th th-day-name dayheader" colspan="2">Day</td>' +
					'<td class="th th-label">Day Start</td>' +
					'<td class="th th-label">Lunch Start</td>' +
					'<td class="th th-label">Lunch Total</td>' +
					'<td class="th th-label">Lunch End</td>' +
					'<td class="th th-label">Day End</td>' +
					'<td class="th th-label">Day total</td>' +
				'</tr>\n'
	}

	/*
	 * Returns the code of the body of the page.
	 */
	_getBody() {
		var d = new Date(this.year, this.month, 0),
			monthLength = d.getDate()
		var html = '<div>'
		html += this._getPageHeader(this.year, this.month)
		html += '<table>'
		html += this._getTableHeaderCode(this.year, this.month)
		for (var day = 1; day <= monthLength; ++day) {
			html += this._getInputsRowCode(this.year, this.month, day)
		}
		html += '</table><br>'
		html += '</div>'

		return html;
	}
}

/*
 * Updates the DB with the information of computed (total lunch time, and day time)
 */
function updateTimeDay(year, month, day) {
	var valuesToSet = computeTimeDay(year, month, day)
	store.set(valuesToSet)
}

/*
 * Compute information of total lunch time and day time
 */
function computeTimeDay(year, month, day) {
	if (!showDay(year, month, day)) {
		return {};
	}
	var valuesToSet = {}

	var dayStr = year + '-' + month + '-' + day + '-';
	var lunchBegin = document.getElementById(dayStr + 'lunch-begin').value
	var lunchEnd = document.getElementById(dayStr + 'lunch-end').value

	if (validateTime(lunchBegin)) {
		valuesToSet[dayStr + 'lunch-begin'] = lunchBegin
	}
	if (validateTime(lunchEnd)) {
		valuesToSet[dayStr + 'lunch-end'] = lunchEnd
	}

	if (validateTime(lunchBegin) && validateTime(lunchEnd) && lunchEnd >= lunchBegin) {
		var lunchTime = subtractTime(lunchBegin, lunchEnd)
		document.getElementById(dayStr + 'lunch-total').value = lunchTime
		valuesToSet[dayStr + 'lunch-total'] = lunchTime
	}
	var dayBegin = document.getElementById(dayStr + 'day-begin').value
	var dayEnd = document.getElementById(dayStr + 'day-end').value
	if (validateTime(dayBegin)) {
		valuesToSet[dayStr + 'day-begin'] = dayBegin
	}
	if (validateTime(dayEnd)) {
		valuesToSet[dayStr + 'day-end'] = dayEnd
	}
	if (validateTime(dayBegin) && validateTime(dayEnd) && dayEnd >= dayBegin) {
		var totalInOffice = subtractTime(dayBegin, dayEnd)
		if (lunchTime) {
			var totalDayTime = subtractTime(lunchTime, totalInOffice)
			totalInOffice = totalDayTime
		}
		document.getElementById(dayStr + 'day-total').value = totalInOffice
		valuesToSet[dayStr + 'day-total'] = totalInOffice
	}

	return valuesToSet;
}

/*
 * Based on the key of the input, updates the values for total in db and display it on page
 */
function updateTimeDayCallback(key) {
	var [year, month, day] = key.split('-');
	updateTimeDay(year, month, day)
	calendar.updateLeaveBy()
}

/*
 * Notify user if it's time to leave
 */
function notifyTimeToLeave() {
	if (document.getElementById('leave-by') == null) {
		return
	}
	var timeToLeave = document.getElementById('leave-by').value
	if (validateTime(timeToLeave)) {
		var [hour, min] = timeToLeave.split(':');
		var now = new Date()
		if (now.getHours() == hour && now.getMinutes() == min) {
			notifyUser();
		}
	}
}

// On page load, create the calendar and setup notification
$(() => {
	calendar = new Calendar();
	setInterval(notifyTimeToLeave, 60000);
})