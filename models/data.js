const mongoose = require('mongoose');

const dataSchema = mongoose.Schema({
  id: Number,
  title: String,
  datePosted: Date,
  lifetime: Number, // Measured in ms
  data: {
    url: String,
    text: String
  },
  postedBy: Number, // this is the ID of the user who posted it
  adminPost: {
    reward: String
  }
});

const dataModel = mongoose.model('Data', dataSchema);
module.exports = {
  dataSchema,
  dataModel
};
