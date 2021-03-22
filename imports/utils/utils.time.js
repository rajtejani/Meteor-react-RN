import moment from 'moment-timezone';

const userTz = moment.tz.guess(true);
const systemTz = 'America/Los_Angeles';

UTILS.time = {
	momentAnyTz(timeQuery, tz) {
		if(timeQuery && tz)
			return moment.tz(timeQuery, tz);
		else if (timeQuery)
			return moment.tz(timeQuery, userTz);
	},

	momentSysTz(timeQuery) {
		return UTILS.time.momentAnyTz(timeQuery, systemTz);
	},

	getTodaysDate(formatString) {
		return moment().format(formatString);
	},

	getNextHour() {
		return moment().add(1, 'h').format('HH:00');
	},

	momentFormatTz(time, format, tz) {
		return moment.tz(time, format, tz);
	},

	formatTimeToSysTz(timeString, userChosenTz) {
		userChosenTz = userChosenTz || userTz;
		const momentTime = UTILS.time.momentFormatTz(timeString, 'YYYY-MM-DD HH:mm', userChosenTz);

		return UTILS.time.momentSysTz(momentTime);
	},

	formatStartDate(date, time) {
		const dateString = `${date} ${time}`;
		const momentTime = UTILS.time.formatTimeToSysTz(dateString, userTz);

		return momentTime.toDate();
	},

	getFriendlyTime(date) {
		const now = moment();
		const dateToFormat = UTILS.time.momentAnyTz(date);
		const differenceInDays = dateToFormat.diff(now, 'days');

		if(differenceInDays < 1) {
			return UTILS.strings.capitalize(dateToFormat.from(now), true);
		}
		else if(differenceInDays === 1) {
			const time = dateToFormat.format('h:mm a').replace(':00', '');
			return `Tomorrow, ${time}`;
		}

		return moment(date).format('LL')
	}
};