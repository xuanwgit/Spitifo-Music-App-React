import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const playlistSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songs: [{
    type: Schema.Types.ObjectId,
    ref: 'Song'
  }]
}, { timestamps: true });

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;
