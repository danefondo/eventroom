import { format, addDays } from 'date-fns';
import { SLOT_INTERVAL_MS } from "../constants";

const ONE_DAY = 24*60*60*1000;


// dayName: format(currentWeekOrDayStart, "eeee"),
// dayNameShort: format(currentWeekOrDayStart, "eee"),
// yearNum: format(currentWeekOrDayStart, "yyyy"),
// monthNum: format(currentWeekOrDayStart, "MM"),
// dateNum: format(currentWeekOrDayStart, "dd"),
// slotStartTime: format(slotStartTime, "HH:mm"),
// slotEndTime: "",

function initialSlotData() {
  return {
    matchPoolUsersForSlot: [], // Array of USER_SCHEMA
    isSelected: false,
    isCanceling: false,
    isAvailableForBooking: true,
    isAvailableForSelecting: true,

    // If there is an active or current session, to make sure
    // ongoing sessions are being shown and to optimize
    // showing the 'Join' button for next and ongoing sessions
    hasCurrentOrNextSession: false,
  };
}

/* ====== CALENDAR RENDERING DATA SETUP ====== */

/**
 * @param {
 *  interval {Number} -- in minutes, the length of one slot
 *  week {Boolean} -- true, if rendering week, false, if day 
 *  currentWeekStartMS {Date} -- the start date of current week view 
 *  currentDayStartMS {Date} -- the start date of current dat
 * } configurationData 
 */
export const generateCalendarData = (configurationData) => {
  const {week, currentWeekStartMS, currentDayStartMS} = configurationData;

  // Initialize empty calendar
  let calendarData = {};

  const nrRows = Math.floor(ONE_DAY/SLOT_INTERVAL_MS);
  const nrDays = week ? 7 : 1;
  const nrSlots = nrDays*nrRows;
  const calendarStartDateMS = week ? currentWeekStartMS : currentDayStartMS;
  
  console.log("calendarStartDate: ", new Date(calendarStartDateMS));
  console.log("calendarStartDateMS: ", calendarStartDateMS)
  for (let i=0; i<nrSlots; i++) {
    const currentDate = calendarStartDateMS + i*SLOT_INTERVAL_MS;
    calendarData[currentDate] = initialSlotData();
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

export const getDayDate = (currentDayStartMS) => {
  return [getDate(currentDayStartMS)];
};