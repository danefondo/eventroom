const aws = require("aws-sdk");

const accessKeyId = "AKIARKLMM5TMEHGOSNJC";
const secretAccessKey = "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";
const region = "us-east-1";
const S3_BUCKET = "curata";

aws.config.update({
  accessKeyId,
  secretAccessKey,
  region,
});

const s3 = new aws.S3();

const imageController = {
  async signS3(fileName, fileType) {
    let response = {};
    try {
      const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: "public-read",
      };

      s3.getSignedUrl("putObject", s3Params, function (error, data) {
        if (error) throw { error };

        const returnData = {
          signedRequest: data,
          url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`,
          fileName: fileName,
        };

        response.returnData = returnData;
        response.success = true;
      });
    } catch (error) {
      response.error = error;
      response.success = false;
      return response;
    }
    return response;
  },

  async uploadSingleImage(req, res) {
    try {
      singleUpload(req, res, function (err) {
        if (err) {
          console.log("error", err);
          res.json({ err: err });
        } else {
          //  If file not found
          if (req.file == undefined) {
            res.json("Error: No file selected!");
          } else {
            // If success
            const imageName = req.file.key;
            const imageLocation = req.file.location; // url of the uploaded image

            let image = new Image();
            image.imageKey = imageName;
            image.imageURL = imageLocation;

            image.save(function (err) {
              if (err) {
                return console.log(err);
              }
            });

            res.json({
              image: imageName,
              location: imageLocation,
            });
          }
        }
      });
    } catch (error) {
      console.log("error", error);
      res.status("500").json({
        message: "An error occurred while uploading image.",
      });
    }
  },

  async saveProfileImageReference(req, res) {
    try {
      let image = new Image();
      image.imageKey = req.body.fileKey;
      image.imageURL = req.body.fileURL;
      image.imageName = req.body.imageName;
      image.streamer_id = req.user._id;

      await image.save();
      let image_id = image._id;

      let user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          errors: "User not found.",
        });
      }

      user.profile_image_url = req.body.fileURL;
      user.profile_image_key = req.body.fileKey;
      user.profile_image_name = req.body.imageName;
      await user.save();

      res.json({
        imageKey: req.body.fileKey,
        imageURL: req.body.fileURL,
        image_id: image_id,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },

  async deleteImage(req, res) {
    try {
      let imageKey = req.body.imageKey;

      let image = await Image.find({ imageKey: imageKey });
      if (!image) {
        return res.status("404").json({
          message: "Could not find image to delete.",
        });
      }

      s3.deleteObject(
        {
          Bucket: "curata",
          Key: "" + imageKey,
        },
        function (err, data) {
          if (err) {
            console.log("Error: ", err);
          }

          Image.deleteOne({ _id: image._id }, function (err) {
            if (err) return console.log(err);
            console.log("Successfully removed image from DB.");

            Stream.findById(req.body.stream_id, function (err, stream) {
              if (err || !stream) {
                return res.status(404).json({
                  errors: "Stream not found.",
                });
              }

              stream.thumbnail_url = undefined;
              stream.thumbnail_key = undefined;
              stream.thumbnail_name = undefined;
              stream.thumbnail_id = undefined;
              console.log("5");
              stream.save(function (err) {
                if (err) {
                  console.log("7");
                  return console.log("Stream save failed: ", err);
                } else {
                  console.log("Stream successfully updated: ", stream);
                  console.log("6");
                  res.status(200).end();
                }
              });
            });
          });
        }
      );
    } catch (error) {
      console.log("error", error);
      res.status("500").json({
        message: "An error occurred while deleting image.",
      });
    }
  },

  async deleteProfileImage(req, res) {
    try {
      let imageKey = req.body.imageKey;

      let image = await Image.find({ imageKey: imageKey });
      if (!image) {
        return res.status("404").json({
          message: "Could not find image to delete.",
        });
      }

      s3.deleteObject(
        {
          Bucket: "curata",
          Key: "" + imageKey,
        },
        function (err, data) {
          if (err) {
            console.log("Error: ", err);
          }

          Image.deleteOne({ _id: image._id }, function (err) {
            if (err) return console.log(err);
            console.log("Successfully removed image from DB.");

            User.findById(req.user._id, function (err, user) {
              if (err) {
                return res.status(404).json({
                  errors: "User not found.",
                });
              }
              console.log("4");

              user.profile_image_url = undefined;
              user.profile_image_key = undefined;
              user.profile_image_name = undefined;
              console.log("5");
              user.save(function (err) {
                if (err) {
                  console.log("7");
                  return console.log("User save failed: ", err);
                } else {
                  console.log("6");
                  res.status(200).end();
                }
              });
            });
          });
        }
      );
    } catch (error) {
      console.log("error", error);
      res.status("500").json({
        message: "An error occurred while deleting image.",
      });
    }
  },
};

module.exports = imageController;
