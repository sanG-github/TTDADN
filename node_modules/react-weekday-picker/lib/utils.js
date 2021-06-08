'use strict';

var WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var WEEKDAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

module.exports = {
  localeUtils: {
    formatWeekdayLong: function formatWeekdayLong(weekday) {
      return WEEKDAYS_LONG[weekday];
    },
    formatWeekdayShort: function formatWeekdayShort(weekday) {
      return WEEKDAYS_SHORT[weekday];
    }
  }
};
//# sourceMappingURL=utils.js.map