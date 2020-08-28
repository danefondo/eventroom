const Event = require("../models/EventModel");
const Room = require("../models/RoomModel");
const OpenTok = require("opentok");
const axios = require("axios");

var apiKey = process.env.API_KEY;
var apiSecret = process.env.API_SECRET;

if (!apiKey || !apiSecret) {
  console.log("You must specify API_KEY and API_SECRET environment variables");
}

const OT = new OpenTok(apiKey, apiSecret);

const EventController = {
  async getAllEvents(req, res) {
    try {
      let events = await Event.find({}).exec();
      if (!events) {
        return res.status(404).json({
          errors: "No events found.",
        });
      }

      res.status(200).json({
        events: events,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },

  async getEvent(req, res) {
    try {
      let eventId = req.params.eventId;
      let event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          message: "Video not found",
        });
      }

      let room = await Room.findById(event.defaultRoomId);
      if (!room) {
        return res.status(404).json({
          message: "Room not found",
        });
      }

      res.status(200).json({
        event: event,
        room: room,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },

  async createEvent(req, res) {
    try {
      let event = new Event();
      let eventData = req.body;

      event.name = eventData.name;
      event.description = eventData.description;
      event.dateCreated = eventData.dateCreated;
      event.creatorId = eventData.userId;

      let room = new Room();
      room.name = event.name;
      room.description = event.description;
      room.dateCreated = event.dateCreated;
      room.hostId = event.creatorId;
      room.parentEventId = event._id;

      event.defaultRoomId = room._id;
      event.rooms.push(room._id);

      //- CREATE VONAGE SESSION
      OT.createSession({ mediaMode: "routed" }, async function (
        error,
        session
      ) {
        if (error) {
          console.log("Error creating session:", error);
        } else {
          // Store the session in the database
          room.sessionId = session.sessionId;
          await room.save();
          await event.save();
          res.status(200).json({
            event: event,
            room: room,
          });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },

  async getRoom(req, res) {
    try {
      let roomId = req.params.roomId;
      let room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          message: "Room not found",
        });
      }

      let hostname = req.headers.host;

      // Configure token options & generate Vonage token
      const tokenOptions = {
        role: "publisher",
        data: `roomid=${roomId}`,
      };
      let sessionId = room.sessionId;
      let token = OT.generateToken(sessionId, tokenOptions);
      room.sessionTokens.push(token);
      await room.save();

      // Send the required credentials back to to the client
      res.status(200).json({
        room,
        hostname,
        apiKey,
        sessionId,
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },

  async findAndUpdateEvent(req, res) {
    try {
      let eventData = req.body;

      let eventId = eventData.eventId;
      let event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          message: "Video not found",
        });
      }

      event.name = eventData.name;
      event.description = eventData.description;

      await event.save();

      res.json({
        event: event,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },

  async deleteEvent(req, res) {
    try {
      let eventData = req.body;
      let eventId = eventData.eventId;
      if (!eventId) {
        return res.status(404).json({
          errors: "Event ID missing.",
        });
      }

      Event.deleteOne({ _id: eventId }).exec(function (err, removed) {
        if (err) {
          return console.log("Failed to delete event: ", err);
        }
      });

      res.status(200).json({
        message: "Event permanently removed.",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message:
          "An error occurred while deleting event, please try again later.",
      });
    }
  },

  async getYouTubeQuery(req, res) {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      // const apiString = "&key=" + YOUTUBE_API_KEY;

      const baseUrl = "https://www.googleapis.com/youtube/v3/search?";
      const part = "snippet";
      const type = "video";
      const order = "viewCount";
      const maxResults = 12;

      let query = req.body.query;
      console.log("query", query);

      let youtubeQuery = `${baseUrl}part=${part}&type=${type}&order=${order}&q=${query}&maxResults=${maxResults}&key=${apiKey}`;

      // let videos = await axios.get(youtubeQuery);
      // videos = JSON.stringify(videos);

      axios
        .get(youtubeQuery)
        .then((response) => {
          console.log("data yt", response.data.items);
          res.json({
            videos: response.data.items,
          });
          // videos = res.data.items;
        })
        .catch((err) => {
          console.log(err);
        });
      // axios.get(youtubeQuery)
      // .then(response => {
      //   console.log(response.data);
      //   videos = response.data;
      // })
      // .catch(error => {
      //   console.log(error);
      // });

      // const videos = await youtube.searchVideos(query, 12);
      // console.log("Videos:");
      // console.log(videos);

      // res.json({
      //   videos: videos,
      // });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },
};

module.exports = EventController;
