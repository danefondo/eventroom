

- [ ] When router link changes, change tab text
- [ ] Handle if nothing booked occurs due to overlap 
- [ ] Unmatched session starting
- [ ] Add link to user profile to session starting
- [ ] Separate session partner & session itself from timer & its messages

Current setup
1. Upon mount of TimerManager.vue, when nextSession is set and initialized, the Vuex values for 'hasJoinedDuringSession' and 'isCurrentlyInSession' are set based on the nextSession value; this covers the cases when these values have been set in the database once already
2. Whenever it is the first join, the session data in the database is updated; and then the local Vuex value is set; this way, the nextSession itself will not need any re-setting.

Desired setup
1. Set and update 'isCurrentlyInSession' with Redis, and check status also through Redis (or set Vuex through Redis).

STATE: SESSION HAS NOT STARTED


STATE: SESSION HAS STARTED

When a user has not joined the session, tell them to get in the session; if they're late (2m), tell the user they're late
1. Session has already begun
2. Session has not finished
3. User has not yet joined
4. User is not currently in the session

When user has already joined the session once, however then has left, when they use the Cofocus app, a message and popup appears telling them to get back in the session
1. Session has already begun
2. Session has not finished
3. User has already joined once
4. User is not currently in the session

When a user in currently in the session and they're using the calendar whilst the session is occurring, let them know time until the end of the session and ask if they're being productive
1. Session has already started
2. Session has not finished
3. User has already joined
4. User is currently in the session

STATE: SESSION HAS ENDED

If there are no other upcoming sessions, say 'Session has completed.'

If user never arrived, say 'You missed the session.'

If there are upcoming sessions, update next session, reset & restart timer








IN-SESSION TIMER!

- [ ] SET NAME OF WITH WHOM SESSION IS STARTING NEXT

CALENDAR-CENTRIC MESSAGES
- [ ] If now > startTime && notJoined && now < endTimeBuffer --> If have already joined, and not in session && on site/calendar --> pop up saying "Get back in the session!" + make sound (or report if smth wrong with session or partner)
    -> upon join, mark 'hasJoinedDuring' &&|| 'hasJoinedBefore' as true
- [ ] If late 2m+, && arrive on Cofocus, show pop up to join session!
    -> get next upcoming session && get 'hasJoinedDuring' (if now > startTime+2 && say session is already on, please join)
- [ ] If now > startTime && notJoined && now < endTimeBuffer --> You're late! Join now!
    --> get 'hasJoinedDuring' && 'hasJoinedBefore'
- [ ] If now > startTime && hasJoined && inSession && now < endTimeBuffer --> Session ends in... Are you being productive?
- [ ] If now > endTime && joined --> Session has completed. (Only if no next session up)

SESSION-CENTRIC MESSAGES
- [ ] If partner is late (parter.hasJoined !== true && now > startTime+2m) --> Your partner is arriving soon.
- [ ] When already joined && partner cancels --> "Your partner has canceled. Would you like us to find you a rematch or would you like to cancel or rebook?"
- [ ] If now > startTime+2m && notJoined && partnerHasCanceled --> Partner has canceled the session while you were late / Partner has rematched. You have a new partner.
- [ ] If sessionHasStarted && onePartnerHasArrived && notJoined && partnerHasCanceled --> Your partner has canceled. We're finding you a new match. Or you can cancel & rebook

SESSION-END TRIGGERS
- [ ] When session ends or has ended --> Set session as finished / load next session
- [ ] Update slot data when session ends to remove "Join" link by removing hasCurrentOrNextSession from slot data

SESSION-START TRIGGERS
- [ ] When start time hits or has hit for current/next session
  - [x] Set session has started
  - [x] Set current session as true
  - [ ] Update server-side "did session start?"

- [ ] Check if user still in session
- [ ] Check if partner in session


THINGS THAT ARE TRIGGERED >FROM THE SESSION< ?
- isCurrentlyInSession
- hasJoinedDuringSession
- hasJoinedBeforeSession
- timestamps

now
startTime
endTime
endTimeBuffer
hasJoined / !hasJoined
sessionCompleted

partner2 --> hasNotJoined

partnerHasCanceledDuringSession

- [ ] If user gets on Cofocus page && they missed previous session && have not checked in since, tell them they missed their last session, therefore we've canceled upcoming consecutive sessions & deduced score by xp








/* TODOS */

// TODO: Set up 'potential match exists field' to show different hover



/* ideas

- Electron or desktop app to set on-screen timer in sync with your session timer

- some sort of 'laps' inside a 90/100 min session, indicating and just letting you know, you made it 'this far' and then you just go on, like a little boost; you can turn it off too; 

- free format, where both set a core frame, but both can optionally set to notify the other 'taking 3m break' or 'taking 5m break'

- times up modal with congratulations or relevant message (e.g. break is over!)

CHAT
- is typing indicator
- send sound ping to the other (possibly with emoticon or secret message)

STATISTICS & TRACKERS
- correlations between 'feeling slow / brain is slow', 'feeling foggy', etc., and possibly tracking some of the foods you eat, hours you work, the kind of work you do, the kind of things you do and also don't do, what you drink and how much, vitamins you take, and so on;


*/

// SCHEDULED FOR LATER
/*

- add on wall 'how can I be and do even better, to consciously, iteratively, intentionally improve and do better, to deliberately practice and write even better code, have even better conversations, have even better negotiations, navigate social situations even better, be even more present, and so on, in all matters; be it business or coding. if I code 400 hours a month, I better fucking get significantly better, not just 'slightly better'. same with business.

*/