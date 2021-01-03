- Created generic SVG vue icon container
- Refresh button inside Switcher.vue, toggles BookingDashboard.vue's getAllBookedUsersForSpecificWeek, and passes true as an argument to trigger the iterative refresh function
- Removed 'day' parameter for getAllBookedUsersForSpecificWeek() function and updated all calls of the function accordingly; and instead set up a check for day/week inside getAllBookedUsersForSpecificWeek()
- Created 'Success' message alert for manual refresh; also created new parameter for getAllBookedUsersForSpecificWeek() called 'manual', set to false by default; this is also added to the iterativeRefreshCalendarSessions() and is passed on from getAllBookedUsersForSpecificWeek; and then at the end of iterativeRefreshCalendarSessions, the condition is checked, and if true, the alert is shown for 3 seconds.

router.js
- added require for verification & changed next calling flow

auth.js store
- added verificationStatus to vuex

auth.js api
- added verificationStatus to parseAuthenticationResponse function

Utils.js
- Added 'verificationStatus' to userInJWT
- Added profileImageUrl to userInJWT
- Added 'preferences to userInJWT
- Added 'blocked' && 'doNotMatchAgain' to userInJWT


Booker.vue
- Added 'isExpanded' to slot data, to toggle expanded area in Booker.vue
- Added filtering for blocked & 'do not match again'
- Added sorting available people
- Added option to cancel a selection from the Booker

calendar.js (vuex)
- Added 'expandSlot()' function to handle expanding a slot

SlotHoverEmpty.vue
- Added function to 'scrollToNewestSelection' which scrolls to the latest selection based on id of the selection which comes from slot dateTime that has been convereted to MS

generateCalendar.js
- added datetime to every row for the table to be able to get both AM/PM & 24h formats + determine whether full hour for either case, when generating the time marked at the beginning of each row

UserModel.js
- calendarPreferences, prefer24HourFormat with default false

BookingDataController.js
- Added 'preferences' of all parties to each session
- Added additional data when matching matching & booking & canceling (so that profileImage, preferences, and so on would be available)



Preference comparison based on matchability scores (also avoids infinite loops) are used in the following scenarios currently:
- When a person is being displayed in the calendar, this currently can also mean that one person from an already matched session could be displayed; as anyone being displayed is only the person and not necessarily their session (if a person is already matched, a new session is created to pair the new couple, and the other person will be attempted for a rematch, you cancel for one, and try to just re-use the booking algorithm again; except in this case, a match is not specified and only preferences are used)
- When a slot is selected, then this list of people is also computed (but only shown once expanded, which initially does happen anyway)
- During rematching
- During repeat booking

- Currently, receives & cancels don't affect this, because the initial shown person is computed, so if something changes inside peopleSessionsForSlot, it will reflect in the calendar

In the future, the same is likely to simply happen during the initial loading of the calendar, and when new people are received