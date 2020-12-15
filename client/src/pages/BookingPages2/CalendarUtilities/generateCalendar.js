import {
  format,
  addDays,
} from "date-fns";


// dayName: format(currentWeekOrDayStart, "eeee"),
// dayNameShort: format(currentWeekOrDayStart, "eee"),
// yearNum: format(currentWeekOrDayStart, "yyyy"),
// monthNum: format(currentWeekOrDayStart, "MM"),
// dateNum: format(currentWeekOrDayStart, "dd"),
// slotStartTime: format(slotStartTime, "HH:mm"),
// slotEndTime: "",

function createDayObjectForTimeRow(slotStartTimeMS) {
  return {
    matchPoolUsersForSlot: [],
    dateTime: new Date(slotStartTimeMS),
    isSelected: false,
    isCanceling: false,
    isAvailableForBooking: true,
    isAvailableForSelecting: true,

    // If there is an active or current session, to make sure
    // ongoing sessions are being shown and to optimize
    // showing the 'Join' button for next and ongoing sessions
    hasCurrentOrNextSession: false,

    hasPastSession: false,
  };
}

function getHourRowDays(calendarStartDateMS, rowIndex, nrDays, SLOT_LENGTH) {
  let hourRowDays = [];
  for (let i=0; i<nrDays; i++) { 
    const slotStartTime = calendarStartDateMS + ONE_DAY*i + rowIndex*SLOT_LENGTH;
    hourRowDays.push(createDayObjectForTimeRow(slotStartTime));
  }
  return hourRowDays;
}

/* ====== CALENDAR RENDERING DATA SETUP ====== */
const ONE_DAY = 24*60*60*1000;

export const generateCalendarData = (configurationData) => {
  const SLOT_LENGTH = configurationData.interval*60*1000;
  let week = configurationData.week;
  let currentWeekStart = configurationData.currentWeekStart;
  let currentSelectedDay = configurationData.currentSelectedDay;
  
  // Initialize empty calendar
  let calendarData = [];

  const nrRows = Math.floor(ONE_DAY/SLOT_LENGTH);
  const nrDays = week ? 7 : 1;
  const calendarStartDate = week ? currentWeekStart : currentSelectedDay;
  const calendarStartDateMS = calendarStartDate.valueOf();
  
  console.log("calendarStartDate: ", calendarStartDate);
  console.log("calendarStartDateMS: ", calendarStartDateMS)
  for (let i=0; i<nrRows; i++) {
    calendarData.push({
      slotStartTime: format(new Date(calendarStartDateMS+i*SLOT_LENGTH), "HH:mm"),
      hourRowDays: getHourRowDays(calendarStartDateMS, i, nrDays, SLOT_LENGTH)
    });
  }
  console.log("@GENERATE CALENDAR: ", calendarData);
  return calendarData;
};


/* ====== CALENDAR SWITCHER RENDERING SETUP ====== */

/**
 * Formats date for switcher rendering
 * @param {Date} date 
 */
const getDate = function(date) {
  return {
    dateNum: format(date, "dd"),
    dayName: format(date, "eeee"),
    dayNameShort: format(date, "eee"),
    monthNameShort: format(date, "MMM"),
    monthNum: format(date, "MM"),
    yearNum: format(date, "yyyy"),
  };
}

export const getWeekDates = (startOfWeek) => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(getDate(addDays(startOfWeek, i)));
  }
  return dates;
};

export const getDayDate = (currentSelectedDay) => {
  return [getDate(currentSelectedDay)];
};