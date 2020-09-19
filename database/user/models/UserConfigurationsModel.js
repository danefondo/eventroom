const mongoose = require('mongoose');
let Schema = mongoose.Schema;
/**
 * This schema contains different user configurations
 */
const UserConfigurationsSchema = new Schema({
  _id: mongoose.Types.ObjectId,

  // Contains information about all the preferences of the eventroom toolbar
  eventroomToolbar: [
    {
      name: String,
      visible: Boolean,
      position: Number,
    }
  ],

});

const UserConfigurations = module.exports = mongoose.model('UserConfigurations', UserConfigurationsSchema);