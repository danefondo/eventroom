# Changelog

All notable changes to this project will be documented in this file. 

## [Robert] - 16-08-2020

### Added
- EventRoomPage.vue to contain an instance of an Event Room
- Made all currently existing events be displayed on HomePage.vue
- EventBox.vue as a component to iterate and display all currently existing events on HomePage.vue
- Added room creation which happens in the same function as event creation for the first default room in any given event
- Created getRoom which gets room and creates a session token
- Added getRoom functionality inside getEvent to get event & room in one request in EventPreviewPage.vue
- Created Session.vue component in Vue components folder
- Created RoomModel.js 
- Added tempUserToken creation & tempUser
- Added TempUserModel.js to support unregistered users from attending events & joining rooms
- Setup Socket.io connection where when the room is created and user present, this will be emitted and the user willbe joined in the backend as well
- Setup Vonage Video Chat Session functionality with Session Creation, Token creation + temporary user & temporary token creation to support unregistered users entering Sessions.

### Changed
- Reverted Nav bar to be included on all pages again in App.vue
- UI changes (html class names & css) on HomePage.vue, EventPreviewPage.vue, CreateEventPage.vue, LoginPage.vue
- Added creatorId field to EventModel.js
- Changed variable names of tempHost to tempUser in auth.js in Vue config and AuthConfig.js in Node.

### Removed
- Removed single use Nav bar from HomePage.vue