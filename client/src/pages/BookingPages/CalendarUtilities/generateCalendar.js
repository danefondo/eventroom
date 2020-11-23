import {
  format,
  addMinutes,
  addDays,
  isBefore,
  isEqual,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from "date-fns";

/* ====== CALENDAR RENDERING DATA SETUP ====== */

export const generateCalendarData = (configurationData) => {
  let maximumTime = configurationData.maximumTime;
  let minimumTime = configurationData.minimumTime;
  let interval = configurationData.interval;
  let week = configurationData.week;
  let currentWeekStart = configurationData.currentWeekStart;
  let currentSelectedDay = configurationData.currentSelectedDay;

  // Create day end time for comparison in loop
  let dayEndTimeString = maximumTime;
  let dayEndHour = dayEndTimeString.split(":")[0];
  let dayEndMin = dayEndTimeString.split(":")[1];
  let dayEndTime = new Date(null, null, null, dayEndHour, dayEndMin);

  // Create slot start hour for hourRowObjects & dayObjects inside hourRowObjects
  let dayStartTimeString = minimumTime;
  let slotStartHour = dayStartTimeString.split(":")[0];
  let slotStartMin = dayStartTimeString.split(":")[1];
  let slotStartTime = new Date(null, null, null, slotStartHour, slotStartMin);

  // Create slot end hour for dayObjects to know where block ends
  let slotEndTime = new Date(null, null, null, slotStartHour, slotStartMin);
  // Add session length interval to produce end time from start time
  slotEndTime = addMinutes(slotEndTime, interval);

  // Initialize empty calendar
  let calendarData = [];

  // Iterate over all hours from start time
  // till end time, e.g. until end time is complete.
  // Prepare each hour's row for week or day
  do {
    // Prepare a single hour row object
    // which is to contain the row's hour
    // and an array of days for the week
    // for that specific hour
    let hourRowObject = {
      slotStartTime: format(slotStartTime, "HH:mm"),
      hourRowDays: [],
    };

    let currentWeekOrDayStart = null;
    if (week) {
      // New date from current week start
      currentWeekOrDayStart = new Date(currentWeekStart.valueOf());
    } else {
      currentWeekOrDayStart = new Date(currentSelectedDay.valueOf());
    }

    hourRowObject.hourRowDays = populateTimeRowWithDays(
      currentWeekOrDayStart,
      slotStartTime,
      slotEndTime,
      week
    );

    calendarData.push(hourRowObject);

    // Switch to next hour
    slotStartTime = addMinutes(slotStartTime, interval);
    slotEndTime = addMinutes(slotEndTime, interval);
  } while (isSameOrBefore(slotStartTime, dayEndTime));

  return calendarData;
};

function populateTimeRowWithDays(
  currentWeekOrDayStart,
  slotStartTime,
  slotEndTime,
  week
) {
  let hourRowDays = [];

  if (week) {
    // Prepare 7 days for the week view
    for (var i = 0; i < 7; i++) {
      // If first day, don't add day
      if (i !== 0) {
        currentWeekOrDayStart = addDays(currentWeekOrDayStart, 1);
      }

      let dayObject = createDayObjectForTimeRow(
        currentWeekOrDayStart,
        slotStartTime,
        slotEndTime
      );

      // Per created day, push to hourRowDays
      hourRowDays.push(dayObject);
    }
  } else {
    // Prepare a single day for the day view
    let dayObject = createDayObjectForTimeRow(
      currentWeekOrDayStart,
      slotStartTime,
      slotEndTime
    );
    hourRowDays.push(dayObject);
  }

  return hourRowDays;
}

function createDayObjectForTimeRow(
  currentWeekOrDayStart,
  slotStartTime,
  slotEndTime
) {
  let dateTime = new Date(currentWeekOrDayStart.valueOf());
  dateTime = setHours(dateTime, getHours(slotStartTime));
  dateTime = setMinutes(dateTime, getMinutes(slotStartTime));
  dateTime = setSeconds(dateTime, "00");
  dateTime = setMilliseconds(dateTime, "000");

  // Values computed and listed here
  // so that they would not need to
  // be recomputed every time they
  // are used in table generation
  let dayObject = {
    userSessionsForSlot: [],
    peopleSessionsForSlot: [],

    // allUserSessionsForSlot: [],
    // allPeopleSessionsForSlot: [],

    // peopleUnmatchedSessionsForSlot: [],
    // peopleMatchedSessionsForSlot: [],

    // matched or unmatched, show these to the user as available to match
    // each user has array of user ids for who they ok with matching 
    // each user also has 'locked in / not locked in' state for current session 
    // (which could be a default)
    // (or locked in if already w/some preferred user or of higher preference priority)
    // if not locked in and user's id matches one of the ids in some user's list
    // then this user can see
    peopleAvailableForMatchingWithUserForSlot: [],

    // experimental
    // get best matchable person and display
    // matchable means it's either an unmatched person
    // or a matched person that has set itself
    // matchable to this specific user or user category
    bestMatchablePickForUser: null,

    dayName: format(currentWeekOrDayStart, "eeee"),
    dayNameShort: format(currentWeekOrDayStart, "eee"),
    yearNum: format(currentWeekOrDayStart, "yyyy"),
    monthNum: format(currentWeekOrDayStart, "MM"),
    dateNum: format(currentWeekOrDayStart, "dd"),
    slotStartTime: format(slotStartTime, "HH:mm"),
    slotEndTime: format(slotEndTime, "HH:mm"),
    dateTime: dateTime,
    isSelected: false,
    isCanceling: false,
    isAvailableForBooking: true,
    isAvailableForSelecting: true,

    // If there is an active or current session, to make sure
    // ongoing sessions are being shown and to optimize
    // showing the 'Join' button for next and ongoing sessions
    hasCurrentOrNextSession: false,

    hasPastMatchedSession: false,

    // isPastHour: false,

    // show diff. box on hover if true (e.g. a box to possibly match w/that person)
    hasUmatchedSessionMatchingPreferences: false,
  };
  return dayObject;
}

function isSameOrBefore(before, after) {
  return isBefore(before, after) || isEqual(before, after);
}

/* ====== CALENDAR SWITCHER RENDERING SETUP ====== */

export const getWeekDates = (startOfWeek) => {
  const dates = [
    {
      dateNum: format(startOfWeek, "dd"),
      dayName: format(startOfWeek, "eeee"),
      dayNameShort: format(startOfWeek, "eee"),
      monthNameShort: format(startOfWeek, "MMM"),
      monthNum: format(startOfWeek, "MM"),
      yearNum: format(startOfWeek, "yyyy"),
    },
  ];
  for (let i = 1; i < 7; i++) {
    startOfWeek = addDays(startOfWeek, 1);
    dates.push({
      dateNum: format(startOfWeek, "dd"),
      dayName: format(startOfWeek, "eeee"),
      dayNameShort: format(startOfWeek, "eee"),
      monthNameShort: format(startOfWeek, "MMM"),
      monthNum: format(startOfWeek, "MM"),
      yearNum: format(startOfWeek, "yyyy"),
    });
  }

  return dates;
};

export const getDayDate = (currentSelectedDay) => {
  let currentDate = new Date(currentSelectedDay.valueOf());
  const date = {
    dateNum: format(currentDate, "dd"),
    dayName: format(currentDate, "eeee"),
    dayNameShort: format(currentDate, "eee"),
    monthNameShort: format(currentDate, "MMM"),
    monthNum: format(currentDate, "MM"),
    yearNum: format(currentDate, "yyyy"),
  };
  let dates = [];
  dates.push(date);
  return dates;
};
