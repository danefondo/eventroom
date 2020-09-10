const UserConfigurations = require('./models/UserConfigurationsModel');
const mongoose = require('mongoose');

const defaults = {
  EVENTROOM_TOOLBAR: [
    {
      name: "YTSearch",
      visible: true,
      position: 0,
    },
    {
      name: "Preferences",
      visible: true,
      position: 6,
    }
  ],
}

const UserConfigurationsUtilities = {
  /**
   * This sets the user configurations to their default values
   * @param {*} userId 
   */
  async setDefaultUserConfigurations(userId) {
    const user_id = mongoose.Types.ObjectId(userId);
    let userConfigurations;
    try {
      userConfigurations = await UserConfigurations.findById(user_id).exec();
    } catch (err) {
      console.log("@createUserConfigurations error: ", err);
      return Promise.reject("error");
    }

    if (!userConfigurations) {
      userConfigurations = new UserConfigurations({_id: user_id});
    } 
    userConfigurations.eventroomToolbar = defaults.EVENTROOM_TOOLBAR;

    return userConfigurations.save();
  },

  /**
   * Sets eventroom toolbar configurations to their new value.
   * @param {*} userId 
   * @param {*} newConfigurations 
   */
  async setEventroomToolbarConfigurations(userId, newConfigurations) {
    const user_id = mongoose.Types.ObjectId(userId);
    let userConfigurations;
    let existed = true;
    try {
      userConfigurations = await UserConfigurations.findById(user_id).exec();
      if (!userConfigurations) {
        existed = false;
        userConfigurations = {eventroomToolbar: defaults.EVENTROOM_TOOLBAR};
      } 
    } catch (err) {
      console.log("@set userconf error:", err);
      return Promise.reject("error");
    }    
    
    // console.log("@set userconf existed?", existed, userConfigurations)
    for (const [key, value] of Object.entries(newConfigurations)) {
      
      const index = userConfigurations.eventroomToolbar.findIndex(e => e.name == key);
      userConfigurations.eventroomToolbar[index] = {
        name: key,
        visible: value.visible,
        position: Number(value.position),
      }

    }
    // console.log("@set userconf new userconf", userConfigurations);
    if (existed) return userConfigurations.save();
    else return userConfigurations;
  },

  async getEventroomToolbarConfigurations(userId) {
    if (userId == null) {
      return defaults.EVENTROOM_TOOLBAR;
    }
    const user_id = mongoose.Types.ObjectId(userId);
    let userConfigurations;
    try {
      userConfigurations = await UserConfigurations.findById(user_id).exec();
      if (!userConfigurations) {
        return defaults.EVENTROOM_TOOLBAR;
      }
      return userConfigurations;
    } catch(err) {
      console.log("geteventroomtoolbar err", err);
      return Promise.reject("error");
    }
  }
};

module.exports = UserConfigurationsUtilities;