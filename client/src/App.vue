<template>
  <div :class="$route.meta.landingPage ? 'landing-container' : 'app-container'">
    <Nav v-if="!$route.meta.hideNavigation" />
    <div v-if="nextSessionIsTenMinToStart">
      {{ `Hack session starting with Tony Stark in ${getTimeLeft} minutes.` }}
    </div>
    <div
      :class="
        $route.meta.hideNavigation ? 'page-container full' : 'page-container'
      "
    >
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { requestWithAuthentication } from "./config/api";

import Nav from "./components/Nav";

import { endOfISOWeek } from "date-fns";

function initialDataState() {
  return {
    /* Next session object */
    nextSession: null,

    /* Next session querying status */
    gettingNextSession: false,
    gettingNextSessionError: false,

    /* Timer numbers */
    timerInterval: null,
    currentTimeInSec: 0,

    /* Next session key times in sec */
    nextSessionStartTimeInSec: 0,
    nextSessionEndTimeInSec: 0,
    nextSessionIntervalInSec: 0,

    /* Times before and after session start time in seconds (full datetime in seconds) */
    tenSecToStartInSec: 0,
    oneMinToStartInSec: 0,
    tenMinToStartInSec: 0,

    /* Status of checks done before session */
    didNextSessionEndedCheck: false,
    didNextSessionLateCheck: false,
    didNextSessionStartCheck: false,
    didNextSessionTenSecCheck: false,
    didNextSessionOneMinCheck: false,
    didNextSessionTenMinCheck: false,

    /* Session status states */
    sessionHasStarted: false,
    sessionHasEnded: false,
    nextSessionIsTenMinToStart: false,
    sessionStartedLessThanFiveMinAgo: false,
  };
}

export default {
  name: "App",

  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
    }),
    getTimeLeft() {
      let timeLeft = this.timeLeft - this.nextSessionIntervalInSec;
      if (this.sessionHasStarted) {
        timeLeft = this.timeLeft;
      }
      const minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;

      if (seconds < 10) {
        seconds = `0${seconds}`;
      }

      return `${minutes}:${seconds}`;
    },

    timeLeft() {
      // return this.countdownTime - this.timePassed;

      // Return difference between current time in seconds and goal time in seconds
      return this.nextSessionEndTimeInSec - this.currentTimeInSec;
    },
  },
  components: {
    Nav,
  },
  data: function () {
    return initialDataState();
  },
  async mounted() {
    // add check if cofocus or not

    // get from database, get all users and calc the next session
    // get them from -1h from now (for assurance)
    // also get +2h this week end, to account for midnight
    // capture next OR ongoing session
    await this.getUserNextSession();

    // if calendar page, actually update

    // set exceptions for 25m && 100m intervals --> if interval == 25 / 50 / 100
  },
  methods: {
    async getUserNextSession() {
      // Get everyone's booked sessions for this week from this time forward (no past sessions)
      try {
        if (!this.user || !this.user._id) {
          // return (window.location.href = "/account/login");
          return;
        }
        this.gettingNextSession = true;

        // Get end of this week
        let endOfWeekDate = endOfISOWeek(new Date());

        // Add +2 hours to end of this week to account for midnight for all intervals
        let endOfWeekPlusTwoHours = new Date(endOfWeekDate.valueOf() + 7200);

        let weekData = {
          endOfWeekPlusTwoHours: endOfWeekPlusTwoHours,
          userId: this.user._id,
        };

        const response = await requestWithAuthentication(
          `post`,
          "/api/booking/getUserNextSession",
          weekData
        );

        let nextSession = response.data.result;
        if (response.data.result.NoSessionsThisWeek) {
          // no next session
          return;
        }

        // if (!nextSession) throw new Error("Failed to fetch next session.");

        if (response.data.success) {
          this.gettingNextSession = false;
          if (!nextSession) {
            this.nextSession = null;
          } else {
            this.nextSession = nextSession;
            this.startCountdownToNextSession();
          }
        }
      } catch (error) {
        console.log("@gettingNextSession Error: ", error);
        this.gettingNextSession = false;
        this.gettingNextSessionError = true;
      }
    },

    // per re-check, must check if session still exists;

    // once in 10 minute window
    // continuously recheck / if any changes to sessions
    // continuously check if time still correct / in sync?
    // then check by the minute? or just watch for changes?

    // resync timers

    startCountdownToNextSession() {
      /* Set session start time in seconds */
      let nextSessionStartTime = this.nextSession.dateTime;
      let nextSessionStartTimeInMS = new Date(nextSessionStartTime).valueOf();
      this.nextSessionStartTimeInSec = Math.floor(
        nextSessionStartTimeInMS / 1000
      );

      /* Set session interval time in seconds */
      let nextSessionIntervalInMin = this.nextSession.sessionInterval;
      this.nextSessionIntervalInSec = nextSessionIntervalInMin * 60;

      /* Set session end time in seconds */
      this.nextSessionEndTimeInSec =
        this.nextSessionStartTimeInSec + this.nextSessionIntervalInSec;

      /* Set session timer checkpoint times */
      this.tenSecToStartInSec = this.nextSessionStartTimeInSec - 10;
      this.oneMinToStartInSec = this.nextSessionStartTimeInSec - 60;
      this.tenMinToStartInSec = this.nextSessionStartTimeInSec - 600;

      // if (sessionAlreadyStarted) {
      // }

      this.startTimer();
    },

    // Check if session still exists

    // Check if user still in session, if not -->

    // Check if partner still there, if not -->

    // Delete session if no match found by start time? or rematch if possible, and if not then delete

    // checkIfNextSessionStillExists() {},
    // checkIfUserStillInSession() {
    //   // Get back in the session!
    // },

    startTimer() {
      // this.timerInterval = setInterval(() => (this.timePassed += 1), 1000);

      this.timerInterval = setInterval(
        () => (this.currentTimeInSec = Math.floor(Date.now() / 1000)),
        1000
      );
    },
    resetCountdownToSession() {
      clearInterval(this.timerInterval);
      this.currentTimerSessionDateTime = 0;
      this.currentTimeInSec = 0;
      this.tenMinLeftToStart = false;
    },
    onTimesUp() {
      clearInterval(this.timerInterval);
    },
  },
  watch: {
    "$store.state.auth.user": function () {
      if (this.user && this.user._id) {
        this.getUserNextSession();
      }
    },
    timeLeft() {
      // console.log("secondsToEndOfSession", secondsToEndOfSession);

      let nowInSec = Math.floor(Date.now() / 1000);

      // if (secondsToEndOfSession) {
      // }
      // bigger numbers = later dates
      // smaller numbers = earlier dates
      // when counter == session interval time, exact session start time has arrived
      // and it comes from a s
      // if count down to end is equal to or less than session interval time
      // Counter counts to end of session
      // therefore checks must happen to

      // 1) 10m before start of session
      // 2) 5m before start of session
      // 3) 1m before start of session
      // 4) 10sec before start of session
      // 5) the actual start of session
      // 6) 5m into the session
      // 7) until the end of the session interval

      // there is a countdown time of seconds left till end of session
      // and a time left to get that seconds till end of session MINUS time passed
      // so each second currently / (not smart datetime tho), timePassed increase +1 at least

      // if secondsToEndOfSession is MORE THAN sessionIntervalInSec but LESS THAN OR EQUAL TO sessionIntervalInSec + 60 (11m to start)
      // if Date.now() in seconds is close to X approximation of startTimeInSeconds

      // until start time is not here, Date.now() is smaller
      // until 10m to start time, Date.now() is 600s smaller

      // startTime == concrete datetime in seconds
      // TenMinBefore = startTime - 600s
      // ElevenMinbefore = startTime - 660s
      // FiveMinBefore = startTime - 300s
      // OneMinBefore = startTime - 60s
      // Date.now() == concrete datetime in milliseconds right now

      // manual session checks in addition to other periodic updates
      // could change various styles with this

      if (
        nowInSec >= this.tenMinToStartInSec &&
        !this.nextSessionIsTenMinToStart &&
        !this.didNextSessionTenMinCheck
      ) {
        // check if session still there
        // if success, then do the following
        this.nextSessionIsTenMinToStart = true;
        this.didNextSessionTenMinCheck = true;
      }

      if (
        nowInSec >= this.oneMinToStartInSec &&
        !this.didNextSessionOneMinCheck
      ) {
        this.didNextSessionOneMinCheck = true;
      }

      if (
        nowInSec >= this.tenSecToStartInSec &&
        !this.didNextSessionTenSecCheck
      ) {
        this.didNextSessionOneMinCheck = true;
      }

      if (
        nowInSec >= this.nextSessionStartTimeInSec &&
        !this.didNextSessionStartCheck
      ) {
        this.didNextSessionStartCheck = true;
        this.sessionHasStarted = true;
      }

      if (
        nowInSec >= this.nextSessionEndTimeInSec &&
        !this.didNextSessionEndedCheck
      ) {
        this.didNextSessionEndedCheck = true;
        this.sessionHasEnded = true;
      }

      // So Date.now() initially is always catching up with those, until they are behind
      // therefore eventually if Date.now() in sec is equal to or more than TenMinBefore, then if not done yet, do timer

      // Same for ElevenMinutes
      // Then I use the same logic for every necessary check
      // If Date.now() in sec == startTimeInSec or more than startTimeInSec
      // If less than 5m in sec more than start time
      // If had joined post 00, say please get back to the session
      // If have not yet joined, say you're late

      // If userHasJoined && userIsInSession
      // 'Session ends in... minutes-seconds'

      // If sessionHasStarted && onePartnerHasArrived && partnerCanceledSession
      // 'It seems your partner has canceled the session.'
      // 'It may have been due to you being late'

      // If countdown has ended, say 'Session completed'.
      // Timeout for that, then set whichever possible new session is next

      // don't check literally every 660 seconds till end of session omfg
      // set checks && if not done, only then do OR if currently doing do not DO, if failed then DO
      // + pass the indicator to getting session which case it is
      // if (secondsToEndOfSession < 660) {
      //   // check if session still exists / is the same && same time
      //   this.getUserNextSession();
      //   if (!this.nextSession) {
      //     this.resetCountdownToSession();
      //   }
      //   let updatedSessionTime = this.nextSession.dateTime.valueOf();
      //   let previousSetTime = this.currentTimerSessionDateTime.dateTime.valueOf();
      //   if (updatedSessionTime !== previousSetTime) {
      //     // If times don't match, session must have changed and
      //     // new session is later or earlier, --> clear existing timer & start new timer.
      //     clearInterval(this.timerInterval);
      //     this.currentTimeInSec = 0;
      //     this.startCountdownToNextSession();
      //   }
      // }
      // if (secondsToEndOfSession < 600) {
      //   this.sessionIsTenMinutesToStart = true;
      // }

      // // move over to more active calculation based on datetime
      // // if when Date.now() > session start time, and no other partner, cancel session
      // if (secondsToEndOfSession === 0) {
      //   this.onTimesUp();
      //   clearInterval(this.timerInterval);
      // }
    },
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap");

$link-color: #111;
$visited-color: #111;
$button-color: #493eff;
$button-hover-color: #493effd1;

.messageTextLink {
  color: #1f3058;
  text-decoration: underline;
}

.messageTextLink:hover {
  color: blue;
}

#app {
  font-family: "Nunito", "Helvetica", "Arial", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

html,
body {
  height: 100%;
  overflow: hidden;
  font-family: "Nunito", "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
    "Lucida Sans", Arial, sans-serif;
}

body {
  overscroll-behavior-y: none;
  overscroll-behavior-x: none;
}

a {
  text-decoration: none;
  color: $link-color;
}
a:visited {
  color: $visited-color;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: scroll;
}

.landing-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 30px);
  border: 1px solid #eee;
  margin: 15px;
  border-radius: 3px;
  background-color: #fbfbfb;
}

.page-container {
  height: calc(100vh - 52px);
  position: relative;
}

.full {
  height: 100vh;
}

.borderless {
  border: none;
}

/* Button styles */

.button {
  outline: none;
  background-color: #493eff;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: unset;
  padding: 10px;
  width: 100%;
  border-radius: 3px;
  cursor: pointer;
  display: block;
  margin: 0 auto;
  margin-top: 25px;
  max-width: 275px;
}
.button:hover {
  background-color: #493effd1;
}

.mb-20 {
  margin-bottom: 20px !important;
}

.flex {
  display: flex;
}

.dont-break-out {
  /* These are technically the same, but use both */
  overflow-wrap: break-word;
  word-wrap: break-word;

  -ms-word-break: break-all;
  /* This is the dangerous one in WebKit, as it breaks things wherever */
  word-break: break-all;
  /* Instead use this non-standard one: */
  word-break: break-word;

  /* Adds a hyphen where the word breaks, if supported (No Blink) */
  // -ms-hyphens: auto;
  // -moz-hyphens: auto;
  // -webkit-hyphens: auto;
  // hyphens: auto;
}

// ::-webkit-scrollbar {
//   width: 10px;
//   height: 4px;
// }

// /* Track */
// ::-webkit-scrollbar-track {
//   background-color: #eaeaea;
//   border-radius: 5px;
// }

// /* Handle */
// ::-webkit-scrollbar-thumb {
//   border-radius: 5px;
//   -webkit-border-radius: 5px;
//   background: rgb(208 208 208 / 80%);
// }

// ::-webkit-scrollbar-thumb:window-inactive {
//   background: rgb(208 208 208 / 80%);
// }
</style>
