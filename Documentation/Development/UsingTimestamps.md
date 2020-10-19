    var schema = mongoose.Schema({
        email: {
            type: String,
            required: true,
            lowercase: true,
            index: {
              unique: true
            }
          },
        expireAt: {
          type: Date,
          /* Defaults 7 days from now */
          default: new Date(new Date().valueOf() + 604800000),
          /* Remove doc 60 seconds after specified date */
          expires: 60
        }
        /* Automatically add createdAt and updatedAt fields to schema */
      }, { timestamps: true })
