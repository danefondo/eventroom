<template>
  <div class="booker">
    <div>{{ user.displayName }}</div>
    <div class="selected">
      <div class="title">Booking</div>
      <div @scroll="handleScroll" class="groups" id="groups">
        <div
          class="yearGroup"
          v-for="(yearGroup, y) in sortedSelections"
          :key="y"
        >
          <div class="year">
            <span>{{ yearGroup.year }}</span>
          </div>
          <div
            class="monthGroup"
            v-for="(monthGroup, x) in yearGroup.months"
            :key="x"
          >
            <div class="month">
              <span>{{ monthGroup.month }}</span>
            </div>
            <div
              class="dateGroup"
              v-for="(dateGroup, i) in monthGroup.dates"
              :key="i"
            >
              <div class="date">
                <span>{{ getDateNum(dateGroup.date) }}</span>
                <span>{{ getShortDay(dateGroup.date) }}</span>
              </div>
              <div
                class="slot"
                :id="getSlotTimeInMS(slot.dateTime)"
                @click="expandSlot($event, slot)"
                v-for="(slot, index) in dateGroup.selections"
                :key="index"
              >
                <div
                  class="details"
                  :class="slot.isExpanded ? 'expanded-details' : ''"
                >
                  <div v-if="getBestAvailable(slot)" class="profile">
                    <ik-image
                      loading="lazy"
                      :transformation="[{ height: 60, width: 60 }]"
                      v-if="getUserInfo(slot, 'profileImage')"
                      :src="getUserInfo(slot, 'profileImage')"
                      class="picture"
                    />
                    <div class="name">
                      {{ getUserInfo(slot, "displayName") }}
                    </div>
                  </div>
                  <div v-else class="empty">No one here yet</div>
                  <div class="time">
                    {{ `${slot.slotStartTime}-${slot.slotEndTime}` }}
                  </div>
                  <div class="cancel" @click="cancelSelection(slot)">x</div>
                </div>
                <div v-if="slot.isExpanded" class="expanded">
                  <div v-if="getBestAvailable(slot)">
                    <div>Current selection details</div>
                  </div>
                  <div v-if="hasMorePeople(slot)">
                    <span>I have many people.</span>
                    <div
                      v-for="(person, p) in getOtherAvailablePeople(slot)"
                      :key="p"
                    >
                      <div class="details">
                        <div class="profile">
                          <ik-image
                            loading="lazy"
                            :transformation="[{ height: 60, width: 60 }]"
                            v-if="person.profileImageUrl"
                            :src="person.profileImageUrl"
                            class="picture"
                          />
                          <div class="name">
                            {{ person.displayName }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else>Looks like no one else is booked here!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="actions" v-if="selectedToBook && selectedToBook.length">
        <button
          class="confirm"
          :class="currentlyBooking ? 'disabled' : ''"
          :disabled="currentlyBooking == true"
          @click="bookManySessions"
        >
          {{ returnBookButtonText }}
        </button>
        <div class="cancel" @click="cancelBooking">Cancel</div>
      </div>
    </div>
    <div v-if="!userHasUpcomingSessions" class="sessionless">
      <p class="title">You haven't booked any sessions this week.</p>
      <p class="subtitle">Book some to kickstart your productivity!</p>
    </div>
    <!-- <form v-if="selectedToBook && selectedToBook.length">
        <input
          class="booking-input"
          autocomplete="off"
          name="title"
          type="text"
          v-model="slotName"
          placeholder="Event title"
        /><br />
        <input
          class="booking-input"
          name="date"
          type="date"
          v-model="slotDateString"
          placeholder="Date"
        /><br />
        <input
          class="booking-input"
          name="start-time"
          type="time"
          v-model="slotStartTime"
          placeholder="Start time"
        /><br />
        <div class="all-users"></div>
      </form> -->
  </div>
</template>

<script>
import { requestWithAuthentication } from "../../../config/api";

/**
 * @todo !!! Currently, constantly redoing the entire
 * computation of getting people. This should probably be stored
 * in memory instead, and only be updated, if data itself has changed,
 * such as when a new person has been added.
 *
 * @abstract could be useful, though novel approaches
 * have been developed by now; nor do these problems exactly
 * match our scenario & our different variables:
 * https://en.wikipedia.org/wiki/Stable_marriage_problem
 * https://en.wikipedia.org/wiki/Gale%E2%80%93Shapley_algorithm
 *
 * @ux: list people > group people;
 *
 * @matching-variables:
 * mic, work type, screensharing, group belonging,
 * lists (favorites, fam, friends, etc),
 * activity type (coding, yoga, exercise)
 */

import {
  getDay,
  format,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isSameDay,
  getYear,
  getMonth,
} from "date-fns";

export default {
  name: "Booker",
  props: [
    "selectedToBook",
    "currentlyBooking",
    "user",
    "slotData",
    "boxHeight",
    "sessionTime",
    "selectedSlotName",
    "selectedInterval",
    "selectedSlotDateString",
    "selectedSlotStartTime",
    "allUserSessions",
    "calendarData",
  ],
  data() {
    return {
      hasMounted: false,
    };
  },
  computed: {
    slotName: {
      get() {
        return this.selectedSlotName;
      },
      set(value) {
        this.$store.dispatch("booking/setSelectedSlotName", value);
      },
    },
    slotDateString: {
      get() {
        return this.selectedSlotDateString;
      },
      set(value) {
        this.$store.dispatch("booking/setSelectedSlotDateString", value);
      },
    },
    slotStartTime: {
      get() {
        return this.selectedSlotStartTime;
      },
      set(value) {
        this.$store.dispatch("booking/setSelectedSlotStartTime", value);
      },
    },
    returnBookButtonText() {
      let bookText = "";
      if (this.currentlyBooking) {
        bookText = "Booking...";
      } else if (!this.currentlyBooking && this.selectedToBook.length > 1) {
        bookText = "Book sessions";
      } else if (!this.currentlyBooking && this.selectedToBook.length < 2) {
        bookText = "Book session";
      }
      return bookText;
    },

    userHasUpcomingSessions() {
      let userUpcomingSessions = false;
      if (this.allUserSessions && this.allUserSessions.length) {
        console.log("um.");
        console.log("sessions", this.allUserSessions);
        this.allUserSessions.forEach((session) => {
          let sessionStartInMS = new Date(session.dateTime).valueOf();
          let now = Date.now();
          console.log("start", sessionStartInMS);
          console.log("now", now);
          if (sessionStartInMS > now) {
            console.log("true");
            userUpcomingSessions = true;
            return;
          }
        });
      }
      return userUpcomingSessions;
    },

    sortedSelections() {
      let groups = [];

      // groups = [
      //   {
      //     year: "2021",
      //     months: [
      //       {
      //         month: "april",
      //         dates: [
      //           {
      //             date: "someDate",
      //             selections: [selection1, selection2],
      //           }
      //         ],
      //       }
      //     ]
      //   }
      // ]

      let selectionsToGroup = this.selectedToBook;

      // Ensure selections appear from earliest to latest
      selectionsToGroup.sort(function (a, b) {
        return new Date(a.dateTime) - new Date(b.dateTime);
      });

      for (var i = 0; i < selectionsToGroup.length; i++) {
        let selection = selectionsToGroup[i];
        let dateTime = new Date(selection.dateTime);
        dateTime = setHours(dateTime, "00");
        dateTime = setMinutes(dateTime, "00");
        dateTime = setSeconds(dateTime, "00");
        dateTime = setMilliseconds(dateTime, "000");

        let year = getYear(dateTime);
        let month = format(dateTime, "MMM");
        let monthNum = getMonth(dateTime);

        let yearIndex = null;
        let yearFound = false;

        if (groups.length) {
          // Check if year already in list
          for (var g = 0; g < groups.length; g++) {
            let groupYear = groups[g].year;
            if (year == groupYear) {
              // Object with selection's year has been found
              yearIndex = g;
              yearFound = true;
              break;
            }
          }
        }

        let monthIndex = null;
        let monthFound = false;

        // If year found, insert to year object
        if (yearFound && yearIndex !== null) {
          // find if month exists
          let yearGroup = groups[yearIndex];
          let months = yearGroup.months;

          for (var m = 0; m < months.length; m++) {
            if (month == months[m].month) {
              monthIndex = m;
              monthFound = true;
              break;
            }
          }

          if (monthFound && monthIndex !== null) {
            let dateGroupFound = false;
            let monthGroup = months[monthIndex];
            let dates = monthGroup.dates;

            for (var d = 0; d < dates.length; d++) {
              let day = dates[d].date;
              if (isSameDay(day, dateTime)) {
                dates[d].selections.push(selection);
                dateGroupFound = true;
                break;
              }
            }

            // Else if dateGroup not found
            // create new date group && insert
            if (!dateGroupFound) {
              let dateGroup = {
                date: dateTime,
                selections: [selection],
              };
              dates.push(dateGroup);
            }

            // Sort date groups earliest to latest
            dates.sort(function (a, b) {
              return new Date(a.date) - new Date(b.date);
            });
          } else {
            let dateGroup = {
              date: dateTime,
              selections: [selection],
            };

            let monthGroup = {
              month,
              monthNum,
              dates: [dateGroup],
            };

            months.push(monthGroup);
            months.sort(function (a, b) {
              return a.monthNum - b.monthNum;
            });
          }
        } else if (!yearFound) {
          let dateGroup = {
            date: dateTime,
            selections: [selection],
          };

          let monthGroup = {
            month,
            monthNum,
            dates: [dateGroup],
          };

          let yearGroup = {
            year,
            months: [monthGroup],
          };

          groups.push(yearGroup);
          // Sort year groups from earliest to latest
          groups.sort(function (a, b) {
            return a.year - b.year;
          });
        }
      }

      return groups;
    },
  },
  methods: {
    handleScroll() {
      let element = document.querySelectorAll(".groups")[0];
      if (!element.classList.contains("scrolled")) {
        element.classList.add("scrolled");
      } else if (
        element.classList.contains("scrolled") &&
        element.scrollTop == 0
      ) {
        element.classList.remove("scrolled");
      }
    },

    expandSlot(event, slot) {
      // Expand, unless click is for cancel selection
      if (!event.target.classList.contains("cancel")) {
        let slotData = {
          isExpanded: slot.isExpanded,
          dateTime: slot.dateTime,
        };
        this.$store.dispatch("calendar/expandSlot", slotData);
      }
    },

    getSlotTimeInMS(dateTime) {
      return new Date(dateTime).valueOf();
    },

    async bookManySessions() {
      let errors = {};
      if (this.currentlyBooking) return;
      if (this.selectedToBook.length < 1) return;
      try {
        this.$store.dispatch("calendar/removeSelectionsInThePast");
        this.$store.dispatch("booking/setCurrentlyBooking", true);

        let sessionsToBook = [];
        let sessionTimes = [];
        // Prepare selected to book data
        this.selectedToBook.forEach((toBook) => {
          let toBookTime = new Date("" + toBook.dateTime);
          let slotData = {
            sessionInterval: this.selectedInterval,
            dateTime: toBookTime,
          };

          sessionTimes.push(toBookTime);
          sessionsToBook.push(slotData);
        });

        // console.log("BEFORE SEND 1 sessiontimes:", sessionTimes);
        // console.log("BEFORE SEND 2 sessionsToBook:", sessionsToBook);

        sessionsToBook = JSON.parse(JSON.stringify(sessionsToBook));

        // Could just use userId in the backend to
        // grab the rest of the user's data
        let sendData = {
          slotsToBookArray: sessionsToBook,
          slotsToBookTimesArray: sessionTimes,
          userId: this.user._id,
          username: this.user.username,
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          displayName: this.user.displayName,
          profileImageUrl: this.user.profileImageUrl,
          preferences: this.user.preferences,
        };

        // console.log("BEFORE SEND 3 sendData:", sendData);

        const response = await requestWithAuthentication(
          `post`,
          `api/booking/bookManySessionSlots`,
          sendData
        );
        let sessions = response.data.result;
        if (!sessions) {
          errors.FailedToBookSession = true;
          throw { errors: errors };
        }

        if (response.data.success) {
          let pushData = {
            sessions,
            userId: this.user._id,
          };
          // console.log("@PUSHDATA FROM RESPONSE", pushData);
          /* ====== ADD TO CALENDAR AFTER BOOKING ====== */
          this.$store.dispatch("calendar/pushManyCalendarSessions", pushData);

          this.$emit("refreshNextOrCurrentSession");

          this.$store.dispatch("booking/setCurrentlyBooking", false);

          this.$nextTick(function () {
            this.pushBookingUpdateToOthers(sessions);
            this.$store.dispatch("calendar/updateCalendarSlotAvailability", 0);
            this.cancelBooking();
          });
        }
      } catch (error) {
        console.log("errorBooking", error);
        this.$store.dispatch("booking/setCurrentlyBooking", false);
      }
    },

    pushBookingUpdateToOthers(sessions) {
      let sessionsInfo = {
        userId: this.user._id,
        sessions: sessions,
        roomType: "cofocus",
      };
      this.$socket.emit("pushSessionsToOthers", sessionsInfo);
    },

    /* Clear all current selections */
    cancelBooking() {
      this.selectedToBook.forEach((slotData) => {
        let slot = JSON.parse(JSON.stringify(slotData));

        let updateData = {
          targetSlot: slot,
          newSlotState: false,
          all: true,
          field: 0,
        };

        this.$store.dispatch(
          "calendar/updateCalendarSelectedSlots",
          updateData
        );
      });

      this.$store.dispatch("calendar/clearAllSelections");

      this.$nextTick(function () {
        this.$store.dispatch("calendar/updateCalendarSlotAvailability", 1);
      });
    },

    /**
     * List of Matching Edge Cases™
     * gotta handle em' all!
     *
     * - All other users are happily matched (e.g. existing score
     * is better or equal) --> Show 'no one here'
     * - All users are matched && have disabled rematching
     *  --> Show 'no one here'
     * -
     *
     */

    /**
     * Check whether slot has more than 1 >Person> (not session)
     * available for matching; important because the array
     * contains Sessions, not People.
     * @param slot -- A single slot in calendarData for a specific dateTime
     * @returns true / false -- Represents whether there are more than
     * one person available for matching for a specific time;
     */
    hasMorePeople(slot) {
      let arrayOfPeople = this.getAvailablePeople(slot);
      console.log("length of array", arrayOfPeople.length);
      let hasMoreThanOne = false;

      if (arrayOfPeople.length && arrayOfPeople.length > 1) {
        hasMoreThanOne = true;
      }

      return hasMoreThanOne;
    },

    /**
     * Default show first best person (if anyone at all)
     * Loop the rest starting from i = 1 (to exclude who's already shown)
     */

    /**
     *
     * General flow:
     * 1. Collect all people from all sessions for slot
     * and per user, collect their individual relevant data
     * into an object
     * 2. Mark whether the user is already matched in their
     * session in the user's respective data object
     * 3. If the user is already matched, compute their
     * current session's match score and also mark it in the
     * respective user's data object
     * 4. Filter out blocked & Do Not Match Again
     * 5. Filter lists & groups (not implemented, just returns array back)
     * 6. Filter for preference & attach matchability score to each
     * user's object
     * 7. Sort users by matchability score & exclude users
     * with an already 'happier match'
     */

    /**
     *
     * @param slot -- A single slot in calendarData for a specific dateTime
     *
     * @returns Array of objects representing all available to match
     * users, for the user, where blocked & 'Do Not Match Again' are
     * already filtered out; where those already in a 'happy match'
     * are not included; where the order is in an order of best match
     * for the user to worst.
     *
     * Each object in the array contains the following data:
     *
     * partnerId
     * displayName
     * profileImageUrl
     * preferences
     * sessionId
     * inMatchedSession
     * (existingSessionMatchScore) -- in the case the user is in a matched session
     *
     * @todo Filter out people who have blocked the user looking for a match
     * (ideally do not send this to the user at all)
     *
     *
     */
    getAvailablePeople(slot) {
      // for sessions, create array of all the people
      let peopleForSlot = [];
      console.log("peopleSessionsForSlot", slot.peopleSessionsForSlot);
      for (var i = 0; i < slot.peopleSessionsForSlot.length; i++) {
        let session = slot.peopleSessionsForSlot[i];

        if (!session.firstPartnerId && !session.secondPartnerId) {
          console.log("Sorcery has occurred where a session has no one in it!");
          return null;
        }

        if (session.firstPartnerId) {
          let person = this.preparePerson(session);
          if (person) {
            peopleForSlot.push(person);
          }
        }

        if (session.secondPartnerId) {
          let person = this.preparePerson(session, true);
          if (person) {
            peopleForSlot.push(person);
          }
        }
      }

      if (peopleForSlot.length) {
        peopleForSlot = this.sortAvailablePeople(peopleForSlot);
      }

      let sortedAvailablePeople = peopleForSlot.length ? peopleForSlot : [];

      return sortedAvailablePeople;
    },

    /**
     * @param slot -- A single slot in calendarData for a specific dateTime
     * @returns Object containing relevant display details of best available
     * for match user for the specific slot dateTime, for the user looking
     * for a match. Relevant display details include displayName, profileImageUrl,
     * and preferences to display the user's preferences.
     *
     * No further safety checks done since checks are done previously.
     */
    getBestAvailable(slot) {
      let arrayOfPeople = this.getAvailablePeople(slot);
      return arrayOfPeople[0];
    },

    /**
     * @param slot -- A single slot in calendarData for a specific dateTime
     * @returns Array of all sorted people other than the first one that
     * are available for matching for the user looking for a match; this
     * is because if there are more than 1 people, the first one is already
     * displayed as the default first choice; this is everyone else.
     */
    getOtherAvailablePeople(slot) {
      let arrayOfPeople = this.getAvailablePeople(slot);

      // Remove first
      arrayOfPeople.shift();

      return arrayOfPeople;
    },

    /**
     * @param session -- A single session Object from peopleSessionsForSlot
     * found inside a calendar slot for a specific dateTime
     * @param partner2 true / false -- indicator of whether to prepare
     * a person object based on the first or second session partner data
     * @returns person object / null
     */
    preparePerson(session, partner2 = false) {
      let eligble = this.checkIfEligbleForMatching(session, partner2);

      if (!eligble) {
        return null;
      }

      let person = null;

      let inMatchedSession = session.firstPartnerId && session.secondPartnerId;

      if (!partner2) {
        person = {
          partnerId: session.firstPartnerId,
          displayName: session.firstPartnerDisplayName,
          profileImageUrl: session.firstPartnerProfileImageUrl,
          preferences: session.firstPartnerPreferences,
          sessionId: session._id,
          inMatchedSession,
        };
      } else {
        person = {
          partnerId: session.secondPartnerId,
          displayName: session.secondPartnerDisplayName,
          profileImageUrl: session.secondPartnerProfileImageUrl,
          preferences: session.secondPartnerPreferences,
          sessionId: session._id,
          inMatchedSession,
        };
      }

      if (person) {
        // Compute existing session match score in case of matched session
        if (inMatchedSession) {
          let score = this.computeExistingSessionMatchScore(session, partner2);

          if (!score && score !== 0) {
            // Set score very high to prevent rematching person
            // with erronous score to prevent creating further chaos.
            score = 9000;
            console.log(`It's over ${score}!!!`);
            console.log("Also, that should like, never happen.");
          } else if (score || score == 0) {
            person.existingSessionMatchScore = score;
          }
        }
      }

      return person;
    },

    /**
     * @param session -- A single session Object from peopleSessionsForSlot
     * found inside a calendar slot for a specific dateTime
     * @param partner2 true / false -- indicator of whether to check
     * eligibility for the first partner or second partner in a session
     * @returns true / false -- represents eligibility for matching
     * based on the relationship between whether user is matched
     * and whether they've enabled or disabled rematching.
     */
    checkIfEligbleForMatching(session, partner2 = false) {
      let partnerPreferences = null;
      if (!partner2) {
        partnerPreferences = session.firstPartnerPreferences;
      } else {
        partnerPreferences = session.secondPartnerPreferences;
      }

      if (!partnerPreferences) {
        console.log("The force was not with this one. Should never happen.");
        return null;
      }

      let eligble = false;

      let rematchingEnabled =
        partnerPreferences.calendarPreferences.rematchingEnabled;

      let inMatchedSession = session.firstPartnerId && session.secondPartnerId;

      if ((!rematchingEnabled && !inMatchedSession) || rematchingEnabled) {
        eligble = true;
      }

      return eligble;
    },

    /**
     * @param peopleForSlot Array of user objects containing
     * the relevant data of booked users availabile for matching
     * for a specific dateTime;
     * @returns Array of sorted users that are available, eligble and
     * suiting for matching for the user seeking a match
     * @todo preferSimilarActivity filtering; the activity is listed
     * probably in the session object, as activities are marked
     * per session individually.
     */
    sortAvailablePeople(peopleForSlot) {
      let preferences = this.user.preferences;
      let preferPeopleFromLists = preferences.preferPeopleFromLists;
      let preferPeopleFromGroups = preferences.preferPeopleFromGroups;

      /**
       * Prefer similar activity requires first adding 'activity categories'
       * to the sessions, such as coding, writing, reading, exercising, etc.,
       * until then, it will be a 'Coming soon' feature.
       */
      // let preferSimilarActivity = preferences.preferSimilarActivity;

      peopleForSlot = this.filterBlockedAndDoNotMatchAgain(peopleForSlot);

      if (preferPeopleFromLists && this.user.lists && this.user.lists.length) {
        peopleForSlot = this.filterForListPeople(peopleForSlot);
      }

      let groups = this.user.groups;
      if (preferPeopleFromGroups && groups && groups.length) {
        peopleForSlot = this.filterForGroupPeople(peopleForSlot);
      }

      peopleForSlot = this.filterForPreferences(peopleForSlot);

      peopleForSlot = this.filterOutHappilyMatched(peopleForSlot);

      peopleForSlot = this.sortByMatchScore(peopleForSlot);

      return peopleForSlot;
    },

    /**
     * @param peopleForSlot Array of user objects containing
     * the relevant data of booked users availabile for matching
     * for a specific dateTime; 
        [{
          partnerId: String, // "552423423323"
          displayName: String, // "John Doe"
          profileImageUrl: String, // "https://www.images.com/coolimage123"
          preferences: Object, // user's preferences
          sessionId: String, // "524588413823"
          inMatchedSession: Boolean, // true / false
          existingSessionMatchScore: Number, // 12 -- only exists if matched 
          and represents the match score the user has with the partner 
          in the user's current matched session.
          matchScore: Number, // 12 -- represents matchability score from the
          perspective of the user looking for a match
          matchScoreFromPersonView: Number, // 12 -- represents matchability
          score from the perspective of the personn who is being looked
          into as a potential match 
        }, 
        ...]
     * 
     * @returns Array of objects containing peopleForSlot
     * where users have been removed, that are already 
     * matched in a session where their current match 
     * score is equal to or higher than the match score 
     * they got with the user looking for a match.
     */
    filterOutHappilyMatched(peopleForSlot) {
      for (var i = peopleForSlot.length - 1; i > -1; i--) {
        let person = peopleForSlot[i];
        let inMatchedSession = person.inMatchedSession;
        let matchScoreFromPersonView = person.matchScoreFromPersonView;
        let matchScore = person.matchScore;
        if (inMatchedSession && matchScore && matchScoreFromPersonView) {
          if (matchScoreFromPersonView >= matchScore) {
            peopleForSlot.splice(i, 1);
          }
        }

        // Safety check for when case of fudged.
        if (inMatchedSession && (!matchScore || !matchScoreFromPersonView)) {
          console.log("A properly bad pie has been baked.");
        }
      }
      return peopleForSlot;
    },

    /**
     * @param peopleForSlot Array of user objects containing
     * the relevant data of booked users availabile for matching
     * for a specific dateTime;
        [{
          partnerId: String, // "552423423323"
          displayName: String, // "John Doe"
          profileImageUrl: String, // "https://www.images.com/coolimage123"
          preferences: Object, // user's preferences
          sessionId: String, // "524588413823"
          inMatchedSession: Boolean, // true / false
          existingSessionMatchScore: Number, // 12 -- only exists if matched 
          and represents the match score the user has with the partner 
          in the user's current matched session.
          matchScore: Number, // 12 -- represents matchability score from the
          perspective of the user looking for a match
          matchScoreFromPersonView: Number, // 12 -- represents matchability
          score from the perspective of the personn who is being looked
          into as a potential match 
        }, 
        ...]
     * 
     * @returns Sorted array of objects of users booked for a slot,
     * from the user object with the highest match score to the lowest.
     */
    sortByMatchScore(peopleForSlot) {
      return peopleForSlot.sort(function (personA, personB) {
        return personB.matchScore - personA.matchScore;
      });
    },

    /**
     * @param peopleForSlot Array of user objects containing
     * the relevant data of booked users availabile for matching
     * for a specific dateTime;
     * @returns Array of objects containing peopleForSlot
     * sorted in order of highest to lowest match score.
     */
    filterForPreferences(peopleForSlot) {
      for (var i = 0; i < peopleForSlot.length; i++) {
        let person = peopleForSlot[i];
        let preferences = person.preferences.matchingPreferences;

        let userOwnPreferences = this.user.preferences.matchingPreferences;

        preferences = this.preparePrefsForComparison(preferences);
        userOwnPreferences = this.preparePrefsForComparison(userOwnPreferences);

        // Sort preferences by priority from the perspective
        // of the user looking for a match
        let score = this.computeMatchabilityScore(
          userOwnPreferences,
          preferences
        );

        person.matchScore = score;

        // Compute match score from the perspective
        // of the user being investigated as a
        // potential match
        let matchScoreFromPersonView = this.computeMatchabilityScore(
          preferences,
          userOwnPreferences
        );

        person.matchScoreFromPersonView = matchScoreFromPersonView;
      }

      // Sort by score
      return peopleForSlot;
    },

    /** Computes how good of a match a user is for another user.
     *
     * @returns Number representing matchability score of
     * any two users from the point of view of the first user.
     *
     * Works through keeping count of a score throughout
     * iterations, where per iteration, if a preference
     * either matches or is neutral for either party,
     * points are added to the score with a weight;
     * This weight loses 1 point per iteration,
     * as each consecutive preference has less importance
     * from the point of view of the user for whom a
     * partner is being searched for.
     *
     */
    computeMatchabilityScore(user1Prefs, user2Prefs) {
      // each iteration, lower down priority
      let weight = user1Prefs.length;

      let score = 0;

      /* Possible to create max_score, which can later during
      matching, break loop, when best possible match is already found,
      based on the matchability score. */
      // let max_score = 0;

      // Loop over array of user's own preferences
      for (var i = 0; i < user1Prefs.length; i++) {
        // String such as "microphone", "screenshare", "workType"
        let user1Preference = user1Prefs[i];
        let user1PrefName = Object.keys(user1Preference)[0];
        let user1PrefValue = null;
        let user1PrioValue = null;

        let user2PrefValue = null;
        let user2PrioValue = null;

        // Get the value for the preference matching the found string
        // by iterating over object keys, such as 'preference' and 'priority'
        for (var key in user1Preference) {
          if (this.checkOwnProperty(user1Preference, key)) {
            let singlePreference = user1Preference[key];
            for (var prefKey in singlePreference) {
              if (this.checkOwnProperty(singlePreference, prefKey)) {
                if (prefKey == "preference") {
                  user1PrefValue = singlePreference[prefKey];
                }

                if (prefKey == "priority") {
                  user1PrioValue = singlePreference[prefKey];
                }
              }
            }
          }
        }

        // Find equivalent value in user 2 for comparison
        for (var x = 0; x < user2Prefs.length; x++) {
          let user2Preference = user2Prefs[x];
          let user2PrefName = Object.keys(user2Preference)[0];

          // Compare preference strings to access same value
          if (user1PrefName == user2PrefName) {
            for (var valueKey in user2Preference) {
              if (this.checkOwnProperty(user2Preference, valueKey)) {
                let singlePreference = user2Preference[valueKey];
                for (var prefValueKey in singlePreference) {
                  if (this.checkOwnProperty(singlePreference, prefValueKey)) {
                    if (prefValueKey == "preference") {
                      user2PrefValue = singlePreference[prefValueKey];
                    }
                    if (prefValueKey == "priority") {
                      user2PrioValue = singlePreference[prefValueKey];
                    }
                  }
                }
              }
            }
          }
        }

        // Confirm that values were found
        // NB! Must not check against !value, because one
        // of the values can be 0, and !value also considers
        // 0 as false.
        if (
          user1PrefValue == null ||
          user1PrioValue == null ||
          user2PrefValue == null ||
          user2PrioValue == null
        ) {
          // return console.log("Preference value not found.");
          console.log("Preference value not found.");
          // console.log("user1PrefValue", user1PrefValue);
          // console.log("user1PrioValue", user1PrioValue);
          // console.log("user2PrefValue", user2PrefValue);
          // console.log("user2PrioValue", user2PrioValue);

          // Set to neutral perfect to keep app working despite total fail!
          user1PrefValue = 1;
          user1PrioValue = 0;
          user2PrefValue = 1;
          user2PrioValue = 0;
        }

        /* Compare the values of the same preference */

        // If value is the same or other user's preference is neutral
        // add weight and +1 to score
        if (
          user1PrefValue == user2PrefValue ||
          user1PrefValue == 1 ||
          user2PrefValue == 1
        ) {
          score = score + weight + 1;

          // If the preference also has the same priority for both, add another +1
          if (user1PrioValue == user2PrioValue) {
            score++;
          }
        }

        // Per round, subtract 1 from weight, as each round is lower in priority
        weight--;
      }

      return score;
    },

    /**
     * With regular .hasOwnProperty check, got an eslint error:
     * "Do not access Object.prototype method 'hasOwnProperty'
     *  from target object  no-prototype-builtins"
     * https://stackoverflow.com/a/39283005
     *
     *
     * @eslint information: https://eslint.org/docs/rules/no-prototype-builtins
     *
     * Done at all in the first place to avoid primitive object
     * property checks. https://stackoverflow.com/a/2869372
     *
     * @param object -- object which values are being
     * iterated over with a for ... in loop
     * @param key -- key in a for ... in loop
     *
     * @returns true / false
     *
     */
    checkOwnProperty(object, key) {
      return Object.prototype.hasOwnProperty.call(object, key);
    },

    /**
     * Compute existing matched session match score to later
     * prevent rematching someone with a worse partner for them.
     *
     * @param session -- A single session Object from peopleSessionsForSlot
     * found inside a calendar slot for a specific dateTime
     * @param partner2 true/false -- indicator for whether
     * to compute the matching score from the point of view of
     * the first or second partner; if partner2 == true,
     * use second partner's point of view
     *
     * @returns Number representing matchability score of
     * any two users in a session from the point of view
     * of the first user.
     */
    computeExistingSessionMatchScore(session, partner2 = false) {
      let partner1Prefs = session.firstPartnerPreferences;
      let partner2Prefs = session.secondPartnerPreferences;

      // NB! Must always compare from first partner's perspective
      // when using this function. Hence this comparison.
      let user1Prefs = partner2 ? partner2Prefs : partner1Prefs;
      let user2Prefs = partner2 ? partner1Prefs : partner2Prefs;

      let score = this.computeMatchabilityScore(user1Prefs, user2Prefs);

      return score;
    },

    /**
     * Convert object of preference objects into array of preference objects,
     * and then sort the array by the priority value in each preference object
     * @returns Array of preference objects sorted by priority number in preference.
     * 
     * The decision to convert to array came based on answer on StackOverflow
     * suggesting objects are not ordered; so rather than sorting the object 
     * of objects by the property key, I've converted it to an array instead.
     * https://stackoverflow.com/a/5467142
     * 
     * 
     * @param preferences (sample) 
     * 
      {
        workType: {
          preference: 0,
          priority: 0,
        },
        microphone: {
          preference: 0,
          priority: 1,
        },
        screenshare: {
          preference: 0,
          priority: 2,
        },
      };
     */
    preparePrefsForComparison(preferences) {
      // Instead of order, you compare the number of priority;
      // for object in object
      // push object into an array
      // sort array of objects by priority number
      let preppedPreferences = [];
      for (var key in preferences) {
        let preferenceValues = {};
        // https://stackoverflow.com/a/2869372
        // hasOwnProperty check to avoid primitive object property checks
        if (this.checkOwnProperty(preferences, key)) {
          let singlePreference = preferences[key];

          // Equivalent to collecting values of "workType"
          // and creatingn a new object { preference: 0, priority: 0}
          for (var propKey in singlePreference) {
            if (this.checkOwnProperty(singlePreference, propKey)) {
              preferenceValues[propKey] = singlePreference[propKey];
            }
          }
        }

        let preferenceObject = {};
        // Equivalent to assigning collected values to "workType"
        preferenceObject[key] = preferenceValues;
        preppedPreferences.push(preferenceObject);
      }

      return preppedPreferences;
    },

    sortPreferencesArray(prefsArray) {
      return prefsArray.sort(function (a, b) {
        let priorityA = null;
        let priorityB = null;

        for (var propA in a) {
          priorityA = a[propA]["priority"];
        }

        for (var propB in b) {
          priorityB = b[propB]["priority"];
        }

        return priorityA - priorityB;
      });
    },

    /**
     * @param peopleForSlot Array of user objects containing
     * the relevant data of booked users availabile for matching
     * for a specific dateTime;
     * @returns Array of user objects / empty array -- represents
     * list of people where all who the user has blocked have been
     * removed from; Note that this can result in returning an
     * empty array.
     */
    filterBlockedAndDoNotMatchAgain(peopleForSlot) {
      /**
       * In this version, blocked & "don't match again" sorting
       * happens here rather than during receive or initial load,
       * because during the receive or initial load,
       * we're still dealing with sessions, not people.
       * And we cannot rule out sessions, since a session
       * can contain both a blocked user and a non-blocked user.
       */
      let blocked = this.user.blocked;
      let doNotMatchAgain = this.user.doNotMatchAgain;

      // If in blocked
      for (var i = peopleForSlot.length - 1; i > -1; i--) {
        let partnerId = peopleForSlot[i].partnerId;
        if (blocked && blocked.length) {
          let inBlocked = blocked.includes(partnerId);
          if (inBlocked) {
            peopleForSlot.splice(i, 1);
          }
        }

        if (doNotMatchAgain && doNotMatchAgain.length) {
          let inDoNotMatchAgain = doNotMatchAgain.includes(partnerId);
          if (inDoNotMatchAgain) {
            peopleForSlot.splice(i, 1);
          }
        }
      }

      return peopleForSlot;
    },

    /**
     * @param peopleForSlot Array of user objects containing
     * the relevant data of booked users availabile for matching
     * for a specific dateTime;
     * @returns Array of user objects -- represents sorted array
     * of users, where if any users in the initial array were
     * part of a list the user looking for a match cares about,
     * then everyone else was removed, and the remaining array
     * of people sorted in the same order of priority as the
     * order of lists in the match seeker's list, and also
     * based on the suborder of the people in each list.
     * @todo the entire function :)
     */
    filterForListPeople(peopleForSlot) {
      return peopleForSlot;
    },

    /**
     * @param peopleForSlot Array of user objects containing
     * the relevant data of booked users availabile for matching
     * for a specific dateTime;
     * @returns Array of user objects -- represents sorted array
     * of users, where if any users in the initial array were
     * part of a group the user looking for match cares about,
     * then everyone else was removed, and the remaining array
     * of people sorted in the same order of priority as the
     * order of groups in the match seeker's group list.
     * @todo the entire function :)
     */
    filterForGroupPeople(peopleForSlot) {
      return peopleForSlot;
    },

    getSlotSession(slot) {
      // math savvy can get all the following from dateTime without date-fns ;)
      let dateTime = new Date(slot.dateTime);

      let startTime = slot.slotStartTime;

      // Sunday == 0 in date-fns
      let dayNum = getDay(dateTime);

      if (dayNum == 0) {
        dayNum = 6;
      } else {
        dayNum--;
      }

      let row = null;
      for (var i = 0; i < this.calendarData.length; i++) {
        if (this.calendarData[i].slotStartTime == startTime) {
          row = i;
          break;
        }
      }

      let calendarSlot = this.calendarData[row]["hourRowDays"][dayNum];
      let sessions = calendarSlot["peopleSessionsForSlot"];

      let session = sessions.length ? sessions[0] : null;

      return session;
    },

    getUserInfo(slot, request) {
      let person = this.getBestAvailable(slot);

      let info = null;

      if (request == "displayName") {
        info = person.displayName;
        if (!info) {
          info = "Nameless Mystery";
        }
      } else if (request == "profileImage") {
        info = person.profileImageUrl;
      }

      return info;
    },

    // getDisplayName(session) {
    //   let displayName = "";

    //   let firstPartner = session.firstPartnerId;
    //   let secondPartner = session.secondPartnerId;

    //   // Checking if not self in case dealing with already matched session previewing
    //   if (firstPartner && firstPartner !== this.user._id) {
    //     displayName = session.firstPartnerDisplayName;
    //   } else if (secondPartner && secondPartner !== this.user._id) {
    //     displayName = session.secondPartnerDisplayName;
    //   }

    //   if (!displayName) {
    //     displayName = "Nameless Mysterious";
    //   }

    //   return displayName;
    // },

    // getProfileImage(session) {
    //   let profileImageUrl = "";

    //   let firstPartner = session.firstPartnerId;
    //   let secondPartner = session.secondPartnerId;

    //   // Checking if not self in case dealing with already matched session previewing
    //   if (firstPartner && firstPartner !== this.user._id) {
    //     profileImageUrl = session.firstPartnerProfileImageUrl;
    //   } else if (secondPartner && secondPartner !== this.user._id) {
    //     profileImageUrl = session.secondPartnerProfileImageUrl;
    //   }

    //   if (!profileImageUrl) {
    //     profileImageUrl = "Nameless Mysterious";
    //   }

    //   return profileImageUrl;
    // },

    getDateNum(date) {
      return format(date, "d");
    },

    getShortDay(date) {
      return format(date, "eee");
    },

    getShortMonth(date) {
      return format(date, "MMM");
    },

    cancelSelection(slot) {
      slot = JSON.parse(JSON.stringify(slot));

      let updateData = {
        targetSlot: slot,
        newSlotState: false,
        all: false,
        field: 0,
      };

      this.$store.dispatch("calendar/updateCalendarSelectedSlots", updateData);

      slot.isSelected = false;

      this.$nextTick(function () {
        // Must be last or component is destroyed before
        this.$store.dispatch("calendar/cancelSlot", slot);
        this.$store.dispatch("calendar/updateCalendarSlotAvailability", 1);
      });
    },
  },

  watch: {
    // Ensure doesn't show div before loaded
    allUserSessions() {
      this.hasMounted = true;
    },
  },
};
</script>
