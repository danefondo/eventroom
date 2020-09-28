const Event = require('../models/EventModel');
const mongoose = require('mongoose');

const UserUtilities = require('../../user/utilities/UserUtilities');

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
    console.log("@geteventpreview");
    try {
      event = await Event.findById(event_id).exec();
      if (!event) throw new Error("could not find event");
    } catch (err) {
      console.log("@geteventpreview error", err);
      return Promise.reject("could not find event");
    }

    let host, hostDisplayName, hostUsername;
    try {
      host = await UserUtilities.getUserById(event.hostId);
      console.log("@geteventpreview host:", host);
      if (host) {  
        hostDisplayName = host.displayName;
        hostUsername = host.username;
      }
    } catch (err) {
      console.log("@geteventprevioew error 2", err);
      return Promise.reject("could not find host");
    }
    const hostId = host ? event.hostId : null;
    const eventPreviewData = {
      _id: event._id.toString(),
      name: event.name,
      description: event.description,
      hostId,
      hostDisplayName,
      scheduledStartTime: event.scheduledStartTime,
    }
    console.log("@eventpreview data", eventPreviewData);
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
      console.log("@getevet error", err);
      return { success: false };
    }

    let host, hostDisplayName, hostUsername;
    try {
      host = await UserUtilities.getUserById(event.hostId);
      if (host) {
        hostDisplayName = host.displayName;
        hostUsername = host.username;
      }
    } catch (err) {
      console.log("@etevent error 2", err);
      return { success: false };
    }

    // TODO <- live room id-s etc
    const eventData = {
      success: true,
      _id: event._id.toString(),
      name: event.name,
      description: event.description,
      hostId: host ? event.hostId : null,
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
        return Promise.reject("could not find events")
      }
      let eventPreviewPromises = [];
      for (let i=0; i<events.length; i++) {
        const eventPreviewPromise = this.getEventPreview(events[i]._id);
        
        eventPreviewPromises.push(eventPreviewPromise);
      }
      console.log("@getallevents", eventPreviewPromises.length);
      console.log("@getallevents", eventPreviewPromises);
      return Promise.all(eventPreviewPromises)
        .then(result => result)
        .catch(err => {
          console.log()
          return err;
        })
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