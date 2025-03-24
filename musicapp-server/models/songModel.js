import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const songSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  album_id: {
    type: Schema.Types.ObjectId,
    ref: 'Album',
    required: true
  },
  playlist_id: {
    type: String,
  },
  file_url: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Song = mongoose.model('Song', songSchema);

export default Song;
