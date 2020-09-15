const axios = require("axios");

const EventUtilities = require('../database/event/EventUtilities');
const RoomUtilities = require('../database/room/RoomUtilities');
const OTUtilities = require('./OTUtilities');


const EventController = {

  /**
   * gets all events, to be removed
   * @param {*} req 
   * @param {*} res 
   */
  async getAllEvents(req, res) {
    try {
      let eventPreviews = await EventUtilities.getAllEvents();
      console.log("@getallevents ontroller ", eventPreviews);
      res.status(200).send({ events: eventPreviews });
    } catch (error) {
      console.log("@getallevents", error);
      res.status(500).send({ error: "An unknown error occurred" });
    }
  },

  /**
   * Responses with an event
   * @param {*} req 
   * @param {*} res 
   */
  async getEvent(req, res) {
    try {
      const eventId = req.params.eventId;
      const event = await EventUtilities.getEvent(eventId);
      if (!event || !event.success) {
        return res.status(500).send({ error: "error finding event" });
      }
      console.log("@getevent data", event);
      res.status(200).send({event});
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: "An unknown error occurred" });
    }
  },

  /**
   * Handles event creation
   * @param {*} req 
   * @param {*} res 
   */
  async createEvent(req, res) {
    try {
      console.log("@createevent", req.body);
      const allowed = req.body.roomCreationAllowed == "1";
      const event = await EventUtilities.createEvent({
        name: req.body.name,
        description: req.body.description,
        creatorId: req.body.userId,
        hostId: req.body.hostId ? req.body.hostId : req.body.userId,
        scheduledStartTime: req.body.scheduledStartTime,            
        roomCreationAllowed: allowed,
      });
      
      return res.status(200).send(event);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },

  /**
   * Creates room using data from request
   * @param {*} req 
   * @param {*} res 
   */
  async createRoom(req, res) {
    // REQUEST VALIDATION 
    if (!req.params || !req.body) {
      return res.status(400).send({ error: "invalid request" });
    }
    console.log("@createroom: req body", req.body);
    
    const eventId = req.params.eventId;
    const hostId = req.body.hostId;
    const userId = req.user._id;
    console.log("@createroom stuff", eventId, hostId, userId);
    if (!eventId || !hostId) {
      return res.status(400).send({ error: "invalid request" });
    }
    let event;
    try {
      event = await EventUtilities.getEventById(eventId);
      if (!event || !event.success) throw new Error("no event")
      console.log("@createroom event: ", event);
      event = event.event;  //lmao 
    } catch(err) {
      console.log("@createroom error:", err);
    }
    if (hostId != event.hostId.toString()) {
      return res.status(400).send({ error: "invalid request" });
    }
    const userIsHost = hostId == userId;
    console.log("@createroom userishost?", userIsHost);
    console.log("@createroom allowcreation? ", event.roomCreationAllowed);
    if (!event.roomCreationAllowed && !userIsHost) {
      return res.status(401).send({ error: "unauthorized" });
    }
    console.log("@createroom validated!");
    // REQUEST VALIDATION END
     
    
    try {
      sessionId = await OTUtilities.createSession(); 
      console.log("@createroom sessiondi:", sessionId);
      const room = await RoomUtilities.createRoom({
        eventId,
        hostId,             
        sessionId
      });      
      console.log("@createroom room:", room);
      await EventUtilities.addRoomToEvent(eventId, room._id);

      return res.status(200).send({ room });
      
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },

  async disconnectFromEvent(req, res) {

    try {
      await OTUtilities.disconnect(req.body.sessionId, req.body.connectionId)
    } catch (err) {
      console.log("err:",err);
      return res.status(500).send({ success: false });
    }
  
    return res.status(200).send({success:true});
  },
  /**
   * Creates session id and lets user into the room
   * @param {*} req 
   * @param {*} res 
   */
  async getRoom(req, res) {
    try {
      const roomId = req.params.roomId;
      console.log("@getroom roomID", roomId);
      console.log("@getroom typof roomid: ", typeof(roomId));
      const room = await RoomUtilities.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({
          message: "Room not found",
        });
      }

      const hostname = req.headers.host;

      const token = OTUtilities.createToken(room)
      room.sessionTokens.push(token);
      await room.save();

      // Send the required credentials back to to the client
      res.status(200).json({
        room,
        hostname,
        apiKey: OTUtilities.apiKey,
        sessionId: room.sessionId,
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },

  // async findAndUpdateEvent(req, res) {
  //   try {
  //     let eventData = req.body;

  //     let eventId = eventData.eventId;
  //     let event = await Event.findById(eventId);
  //     if (!event) {
  //       return res.status(404).json({
  //         message: "Video not found",
  //       });
  //     }

  //     event.name = eventData.name;
  //     event.description = eventData.description;

  //     await event.save();

  //     res.json({
  //       event: event,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({
  //       errors: "An unknown error occurred",
  //     });
  //   }
  // },

  // async deleteEvent(req, res) {
  //   try {
  //     let eventData = req.body;
  //     let eventId = eventData.eventId;
  //     if (!eventId) {
  //       return res.status(404).json({
  //         errors: "Event ID missing.",
  //       });
  //     }

  //     Event.deleteOne({ _id: eventId }).exec(function (err, removed) {
  //       if (err) {
  //         return console.log("Failed to delete event: ", err);
  //       }
  //     });

  //     res.status(200).json({
  //       message: "Event permanently removed.",
  //     });
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).json({
  //       message:
  //         "An error occurred while deleting event, please try again later.",
  //     });
  //   }
  // },

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

  async deleteAll(req, res) {
    try {
      await RoomUtilities.deleteAll();
      console.log("DELETED")
    } catch(err) {
      console.log(err)
    }
    return res.status(200).send({ success: true})
  }
};

module.exports = EventController;
