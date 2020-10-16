In light of the absolutely horrible and supremely disorganized and scattered piece of shit documentation Twilio has provided for their Twilio Programmable Video service, we have decided to write and maintain our own version and guide of their various documentations that is more orderly and with a higher degree of completeness. This includes any relevant or useful to us links to various Twilio guides and their Github Issue discussions


### The events that should happen and their completion status
- [ ] When the first participant joins, add them to the participant list, create their container and attach their media tracks to it
- [ ] When a participant joins, add them to the participant list, create thei

#### When a participant joins
- [x] Add them to the `participants` array, which renders their container element with identifiers 
- [x] Attach the participants media tracks to their respective container using the matching identifier (sid or identity inside Participant object)
- [x] Add any already existing participants' to the `participants` array, and then add their tracks to their respective created containers in the DOM (these participants are accessed in the returned room the user gets when they connect to Twilio)
- [x] Setup listening for any new participants joining the room with the 'participantConnected' event the room has, and add any such Participants to the `participants` array, and then attach their tracks (if any) to their respective created containers in the DOM
- [x] Setup listening for any participants disconnecting from the room with the 'participantDisconnected' event the room has, (optionally detach their tracks) and remove any such Participants from the `participants` array using appropriate identifiers
- [x] Setup listening to the room being disconnected server-side or set to a 'completed' status using the `disconnected` event available to the room, and remove all Participants from the `participants` array.
- [x] Setup handling user closing the window, browser or navigating to another website using `window.unbeforeunload` to run `room.disconnect()` for the user right before they've left the room
- [x] Setup listening to when a Remote Participant publishes a track, using the event signal `trackPublished`, that is the ideal time to set up a listener for when you as the Local Participant successfully subscribe to the TrackPublication using the event signal `subscribed`, and then, if successful, is the best time to attach the tracks to the container
- [ ] Setup listening to when a Remote Participant unpublishes a track
- [ ] Setup listening to when you've successfully subscribed to a Remote Participant's publication, after this is the safest time to filter and decide whether to attempt adding tracks to the container
- [ ] Setup listening to when you've successfully unsubscribed to a Remote Participant's publication
- [ ] Setup listening to when you've failed to subscribe to a Remote Participant's publication