<template>
  <div class="calendar">
    <div class="wrapper">
      <SessionCalendar />
      <div class="sidebar">Random things</div>
    </div>

    <div class="modal">
      <div class="modal-body">
        <form>
          <input name="title" type="text" placeholder="Event title" /><br />
          <input
            name="date"
            type="date"
            v-model="date"
            placeholder="Date"
          /><br />
          <input
            name="start-time"
            type="time"
            v-model="startTime"
            placeholder="Start time"
          /><br />
          <input
            name="end-time"
            type="time"
            v-model="endTime"
            placeholder="End time"
          />

          <div class="all-users"></div>
        </form>
        <div @click="bookSession">Book session</div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 
 * Components to create
 * 1. Calendar
 * 2. CalendarSlot
 
 Most efficient way of rendering calendar and its contents?

1. First pre-render calendar layout based on configuration
2. Then begin displaying sessions based on config
3. CSS based on config, e.g. height of a box
4. Time starts by default either from 12AM Monday OR your specified time slot

No more shitty product experiences.
Enough is enough.
Welcome to Cofocus.

 */

import SessionCalendar from "./CalendarComponents/SessionCalendar";
import { requestWithAuthentication } from "../../config/api";
import { mapState } from "vuex";
import moment from "moment";

export default {
  name: "BookingDashboard",
  data() {
    return {
      startTime: null,
      endTime: null,
      date: null,
      gettingBookedSessions: false,
      gettingBookedSessionsError: false,
      bookedSessions: [],
      interval: 60,
      minimumTime: "08:00",
      maximumTime: "16:00",
      height: 70,
    };
  },
  computed: {
    ...mapState({
      bookingData: (state) => state.booking.bookingData,
      start: (state) => state.booking.bookingData.startTime,
      user: (state) => state.auth.user,
    }),
  },
  components: {
    SessionCalendar,
  },
  //   computed: {
  //     ...mapState({
  //       user: (state) => state.auth.user,
  //       isAuthenticated: (state) => state.auth.authenticationStatus,
  //       isVerified: (state) => state.auth.verificationStatus,
  //     }),
  //   },
  async mounted() {
    if (
      this.bookingData.startTime &&
      this.bookingData.endTime &&
      this.bookingData.date
    ) {
      this.startTime = this.bookingData.startTime;
      this.endTime = this.bookingData.endTime;
      this.date = this.bookingData.date;
    }
    // await this.getAllSessionsForThisWeek();
    await this.getUserBookedSessionsForThisWeek();
    this.plotEvents();
  },
  methods: {
    async getUserBookedSessionsForThisWeek() {
      try {
        if (!this.user || !this.user._id) {
          return (window.location.href = "/");
        }
        this.gettingBookedSessions = true;

        let userData = {
          userId: this.user._id,
        };

        const response = await requestWithAuthentication(
          `post`,
          "/api/booking/getUserBookedSessionsForThisWeek",
          userData
        );

        let bookedSessions = response.data.result;
        if (!bookedSessions) throw new Error("Failed to fetch user sessions.");

        console.log("sessions", bookedSessions);

        if (response.data.success) {
          this.gettingBookedSessions = false;
          bookedSessions.forEach((room) => {
            this.bookedSessions.push(room);
          });
          // add rooms to vuex or local storage to display them in order of creation or in the order of chosen preference;
          // then display the rooms
        }
      } catch (error) {
        console.log("@gettingBookedSessions Error: ", error);
        this.gettingBookedSessions = false;
        this.gettingBookedSessionsError = true;
      }
    },
    async bookSession() {
      try {
        let sendData = JSON.parse(JSON.stringify(this.bookingData));
        sendData.userId = this.user._id;
        const response = await requestWithAuthentication(
          `post`,
          `api/booking/bookSessionSlot`,
          sendData
        );
        console.log("response", response);
      } catch (error) {
        console.log("errorBooking", error);
      }
    },
    // A couple of options for matching
      // Either keep additional Calendar Model
      // where all sessions are kept separately
      // or just keep the sessions modal
      // and can mark 'old sessions' as old
      // AND move them somewhere else to minimize query time
      // with new sessions

    // No 'auto-matching' necessary, albeit can have
      // matching suggestions ('Your X friend is matched 15 minutes from your current session [time15MinutesBefore], would you like to rebook?)

    // All that is necessary is that when someone is booked
      // either just match them with their choice
      // or if someone unmatches
      // then either match up with first available if only one free
      // else filter against the person by preferences

    // See OTHERS on the calendar
    plotEvents() {
      // clearAllEvents();
      this.bookedSessions.forEach((eachEvent) => {
        const diffMinutes = moment(eachEvent.scheduledStartTime, "HH:mm").diff(
          moment(this.minimumTime, "HH:mm"),
          "minutes"
        );

        console.log("diffMin", diffMinutes)
        // this will fail for events that transcend a day
        const eventLength = moment(eachEvent.scheduledEndTime, "HH:mm").diff(
          moment(eachEvent.scheduledStartTime, "HH:mm"),
          "minutes"
        );
        const rowIndex = Math.floor(diffMinutes / this.interval);
        const diffMinutesInTimeFrame = diffMinutes - rowIndex * this.interval;
        let date = eachEvent.scheduledDate.split('-');
        let dateNumber = new Date(eachEvent.scheduledDate);
        dateNumber = dateNumber.getUTCDate();
        console.log("date", date);
        const column = document.querySelector(`[data-date="${dateNumber}"]`);
        if (column && column.dataset.month === date[1]) {
          const columnIndex = parseInt(column.dataset.index);
          const eventHtml = `<div class="event">My Booked Session</div>`;
          const cell = document.querySelector(
            `tbody tr:nth-of-type(${rowIndex + 1}) td:nth-of-type(${
              columnIndex + 1
            })`
          );
          cell.innerHTML = eventHtml;
          cell.children[0].style.height = `${
            (eventLength / this.interval) * this.height
          }px`;
          //console.log(minute, ((minute % interval) / interval) * height)
          cell.children[0].style.top = `${
            (diffMinutesInTimeFrame / this.interval) * this.height
          }px`;
        }
      });
    },
    // async getAllEvents() {
    //   try {
    //     const { data } = await axios.get(`/api/events/getAllEvents`);
    //     console.log("@home data", data);
    //     this.events = data.events;
    //   } catch (error) {
    //     console.log("error", error);
    //   }
    // },
  },
  watch: {
    start: function () {
      if (
        this.bookingData.startTime &&
        this.bookingData.endTime &&
        this.bookingData.date
      ) {
        this.startTime = this.bookingData.startTime;
        this.endTime = this.bookingData.endTime;
        this.date = this.bookingData.date;
      }
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  justify-content: space-between;
}

.calendar {
  width: 78%;
}

.sidebar {
  width: 20%;
}

.modal {
  position: fixed;
  width: 22%;
  height: 100vh;
  top: 0;
  right: -22%;
  right: 17%;
  z-index: 3;
  background: #fff;
  align-items: center;
  justify-content: center;
  display: flex;
}

</style>