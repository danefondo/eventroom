const Event = require('./models/EventModel');
const mongoose = require('mongoose');

const UserUtilities = require('../user/UserUtilities');

const EventUtilities = {
  
  /**
   * Creates event with given data
   * @param {*} eventData - object containing event data
   * {
   *  name,
   *  description,
   *  creatorId,
   *  hostId,
   *  scheduledStartTime,
   *  scheduledEndTime
   * }
   */
  async createEvent(eventData) {
    const event = new Event({
      name: eventData.name,
      description: eventData.description,
      dateCreated: new Date(),
      
      // Creators and admins
      creatorId: mongoose.Types.ObjectId(eventData.creatorId),
      hostId: mongoose.Types.ObjectId(eventData.hostId),

      // Scheduling
      scheduledStartTime: eventData.scheduledStartTime,
      scheduledEndTime: eventData.scheduledEndTime,

      roomCreationAllowed: eventData.roomCreationAllowed,
    }); 
    console.log("@ceutils:", event);
    return event.save();
  },

  /**
   * Adds a room to event's room array
   * @param {*} eventId 
   * @param {*} roomId 
   */
  async addRoomToEvent(eventId, roomId) {
    const event_id = mongoose.Types.ObjectId(eventId);
    const room_id = mongoose.Types.ObjectId(roomId);
    let event;
    try {
      event = await Event.findById(event_id).exec();
      if (!event) throw new Error("could not find event");
    } catch (err) {
      console.log("@addroomtoevent error: ", err);
      return Promise.reject("could not find event");
    }

    if (event.rooms) {
      event.rooms.push(room_id);
    } else {
      event.rooms = [room_id];
    }
    return event.save();
  },


  /**
   * Returns the preview data of the event
   * @param {*} eventId 
   * @return preview data of the event
   */
  async getEventPreview(eventId) {
    const event_id = mongoose.Types.ObjectId(eventId);
    let event;
    try {
      event = await Event.findById(event_id).exec();
      if (!event) throw new Error("could not find event");
    } catch (err) {
      console.log("@geteventpreview error", err);
      return Promise.reject("could not find event");
    }

    let hostDisplayName, hostUsername;
    try {
      const host = await UserUtilities.getUserById(event.hostId);
      if (!host) throw Error("no host"); 
      hostDisplayName = host.displayName;
      hostUsername = host.username;
    } catch (err) {
      console.log("@geteventprevioew error 2", err);
      return Promise.reject("could not find host");
    }

    const eventPreviewData = {
      _id: event._id.toString(),
      name: event.name,
      description: event.description,
      hostId: event.hostId,
      hostDisplayName,
      scheduledStartTime: event.scheduledStartTime,
    }
    return eventPreviewData;
  },

  /**
   * Returns all data necessary for event
   * @param {*} eventId 
   */
  async getEvent(eventId) {
    const event_id = mongoose.Types.ObjectId(eventId);
    let event;
    try {
      event = await Event.findById(event_id).exec();
      if (!event) throw new Error("could not find event");
    } catch (err) {
      console.log("@geteventpreview error", err);
      return { success: false };
    }

    let hostDisplayName, hostUsername;
    try {
      const host = await UserUtilities.getUserById(event.hostId);
      hostDisplayName = host.displayName;
      hostUsername = host.username;
    } catch (err) {
      console.log("@geteventprevioew error 2", err);
      return { success: false };
    }

    // TODO <- live room id-s etc
    const eventData = {
      success: true,
      _id: event._id.toString(),
      name: event.name,
      description: event.description,
      hostId: event.hostId,
      hostDisplayName,
      scheduledStartTime: event.scheduledStartTime,
      rooms: event.rooms,
      roomCreationAllowed: event.roomCreationAllowed,
    }
    return eventData;
  },

  /**
   * Shall be deleted, placeholder to have some sense of what homepage is going to look like
   */
  async getAllEvents() {
    try {
      let events = await Event.find({}).exec();
      if (!events) {
        return res.status(404).json({
          errors: "No events found.",
        });
      }
      let eventPreviewPromises = [];
      for (let i=0; i<events.length; i++) {
        const eventPreviewPromise = this.getEventPreview(events[i]._id);
        eventPreviewPromises.push(eventPreviewPromise);
      }
      
      return Promise.all(eventPreviewPromises)
        .then(result => result)
        .catch(err => err)
    } catch (error) {
      console.log(error);
      return Promise.reject("error occurred");
    }
  },

  /**
   * Returns event by id
   * @param {} eventId 
   */
  async getEventById(eventId) {
    const event_id = mongoose.Types.ObjectId(eventId);
    let event;
    try {
      event = await Event.findById(event_id).exec();
      if (!event) throw new Error("could not find event");
    } catch (err) {
      console.log("@geteventpreview error", err);
      return { success: false };
    }
    return {success: true, event};
  }
}

module.exports = EventUtilities;