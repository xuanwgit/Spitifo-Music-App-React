import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const albumSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  favorites: [{
    type: String,  // Will store user IDs who favorited this album
  }],
  //TEST with ref id instead of push into empty array
  songs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
  ],
});

const Album = mongoose.model("Album", albumSchema);
export default Album;
