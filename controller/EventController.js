const Event = require("../models/EventModel");

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
            events: events
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
    
          res.status(200).json({
            event: event
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


};

module.exports = EventController;