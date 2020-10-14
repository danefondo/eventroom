### Troubleshoot analysis of using Vue Socket IO

The case was that when joining the room, and after having connected and subscribed to all the events, when I left that room and then rejoined, messages started being received n amount of times as n amount of times I left and rejoined. 

This was an indication that somewhere, something was not properly disconnected or unlistened to or unsubscribed to, because despite having left the room server side, upon return, I was receiving data for 2+ connections (number coming from amount of times left-rejoined).

Through trial and error it became more evident what does what, and through reading through many tutorials, pages, including peeking into the source code, a clearer picture emerged.


It was handlers and listeners stacked on top of each other.
- https://stackoverflow.com/questions/44166273/socket-io-sends-two-messages
- https://stackoverflow.com/questions/50184957/socket-io-creating-multiple-connections-on-page-refresh

# Handling other reasons for duplicates:
- https://stackoverflow.com/questions/24471709/socket-io-send-message-twice
- https://stackoverflow.com/questions/51430187/socket-io-duplicated-message

# Difference between 'socket' and 'io'
- https://www.nickang.com/2018-02-26-difference-socket-broadcast-io/

# Correct way of joining and leaving rooms
- https://stackoverflow.com/questions/34909323/socket-io-how-to-correctly-join-and-leave-rooms 
- The flow: https://stackoverflow.com/questions/53196749/socket-io-leave-current-room-and-join-after-button-is-clicked
- https://www.semicolonworld.com/question/47305/socket-io-how-to-correctly-join-and-leave-rooms

# Vue.js specifics
- Connect ONLY once, meaning create a single location for the socket connection;
- Use 'only once' like in React: https://dev.to/bravemaster619/how-to-prevent-multiple-socket-connections-and-events-in-react-531d 

# Remove listeners in the server side
- https://www.reddit.com/r/node/comments/9ku76z/socketio_sending_n_messages_when_joining_room_n/ 
- https://stackoverflow.com/questions/54759851/socket-io-sends-message-twice-and-get-it-again/54764342 
- https://stackoverflow.com/questions/19217459/how-do-you-stop-listening-to-a-socket-io-channel 
- https://stackoverflow.com/questions/9418697/how-to-unsubscribe-from-a-socket-io-subscription 
- https://stackoverflow.com/questions/48137228/socket-io-changefeed-multiple-emits-on-refresh-reload

# Disconnect completely server-side
- https://stackoverflow.com/questions/5048231/force-client-disconnect-from-server-with-socket-io-and-nodejs
- https://stackoverflow.com/questions/40370395/socket-io-socket-disconnect

# Get connection status
- https://stackoverflow.com/questions/16518153/get-connection-status-on-socket-io-client


The ecosystem.

SocketIO has a few useful resources:
- Client side API docs
- Server side API docs
- Emit cheatsheet (https://socket.io/docs/emit-cheatsheet/)
- Source code!


Several issues were discovered.
- Server was emitting to everyone, including original sender, when it was not necessary. Fixing this removed one of the duplicates.

# Check if socket is in given room / Check if client in specific room
- https://stackoverflow.com/questions/23045245/one-line-check-if-socket-is-in-given-room

# SocketIO Implementation examples
- Traversy Media: https://github.com/bradtraversy/chatcord/blob/master/server.js
- Zipcall.io source code


# Questions
- What is the role and purpose of each function here? E.g. .removeAllListeners(eventroomId)? Is it needed?