import Song from '../models/songModel.js';
import Album from '../models/albumModel.js';
import mongoose from 'mongoose';

// Get all songs
export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.status(200).json(songs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get songs by album
export const getAlbumSongs = async (req, res) => {
  const { albumId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(albumId)) {
    return res.status(404).json({ error: 'No such album' });
  }

  try {
    const songs = await Song.find({ album_id: albumId }).sort({ createdAt: -1 });
    res.status(200).json(songs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single song
export const getSong = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such song' });
  }

  try {
    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({ error: 'No such song' });
    }
    res.status(200).json(song);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create a new song
export const createSong = async (req, res) => {
  const { title, album_id, file_url } = req.body;
  const user_id = req.user._id;

  try {
    // Check if album exists and user owns it
    const album = await Album.findById(album_id);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    if (album.user_id !== user_id) {
      return res.status(403).json({ error: 'Not authorized to add songs to this album' });
    }

    const song = await Song.create({ title, album_id, file_url });
    
    // Add song to album's songs array
    await Album.findByIdAndUpdate(album_id, {
      $push: { songs: song._id }
    });

    res.status(201).json(song);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a song
export const deleteSong = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such song' });
  }

  try {
    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({ error: 'No such song' });
    }

    // Check if user owns the album this song belongs to
    const album = await Album.findById(song.album_id);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    if (album.user_id !== user_id) {
      return res.status(403).json({ error: 'Not authorized to delete this song' });
    }

    await song.remove();
    
    // Remove song from album's songs array
    await Album.findByIdAndUpdate(song.album_id, {
      $pull: { songs: song._id }
    });

    res.status(200).json(song);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a song
export const updateSong = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such song' });
  }

  try {
    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({ error: 'No such song' });
    }

    // Check if user owns the album this song belongs to
    const album = await Album.findById(song.album_id);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    if (album.user_id !== user_id) {
      return res.status(403).json({ error: 'Not authorized to update this song' });
    }

    const updatedSong = await Song.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );

    res.status(200).json(updatedSong);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 