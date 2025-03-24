import Playlist from '../models/playlistModel.js';
import mongoose from 'mongoose';

// Get all playlists for a user
export const getPlaylists = async (req, res) => {
  const user_id = req.user._id;
  try {
    const playlists = await Playlist.find({ user_id })
      .sort({ createdAt: -1 })
      .populate('songs');
    res.status(200).json(playlists);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single playlist
export const getPlaylist = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such playlist' });
  }

  try {
    const playlist = await Playlist.findOne({ _id: id, user_id }).populate('songs');
    
    if (!playlist) {
      return res.status(404).json({ error: 'No such playlist' });
    }

    res.status(200).json(playlist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create a new playlist
export const createPlaylist = async (req, res) => {
  const { title, description } = req.body;
  const user_id = req.user._id;

  try {
    const playlist = await Playlist.create({ 
      title, 
      description, 
      user_id,
      songs: []
    });
    res.status(201).json(playlist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a playlist
export const deletePlaylist = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such playlist' });
  }

  try {
    const playlist = await Playlist.findOneAndDelete({ _id: id, user_id });

    if (!playlist) {
      return res.status(404).json({ error: 'No such playlist' });
    }

    res.status(200).json(playlist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a playlist
export const updatePlaylist = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such playlist' });
  }

  try {
    const playlist = await Playlist.findOneAndUpdate(
      { _id: id, user_id },
      { ...req.body },
      { new: true }
    ).populate('songs');

    if (!playlist) {
      return res.status(404).json({ error: 'No such playlist' });
    }

    res.status(200).json(playlist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add a song to a playlist
export const addSongToPlaylist = async (req, res) => {
  const { id } = req.params;
  const { songId } = req.body;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such playlist' });
  }

  try {
    const playlist = await Playlist.findOneAndUpdate(
      { _id: id, user_id },
      { $addToSet: { songs: songId } },
      { new: true }
    ).populate('songs');

    if (!playlist) {
      return res.status(404).json({ error: 'No such playlist' });
    }

    res.status(200).json(playlist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove a song from a playlist
export const removeSongFromPlaylist = async (req, res) => {
  const { id, songId } = req.params;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such playlist' });
  }

  try {
    const playlist = await Playlist.findOneAndUpdate(
      { _id: id, user_id },
      { $pull: { songs: songId } },
      { new: true }
    ).populate('songs');

    if (!playlist) {
      return res.status(404).json({ error: 'No such playlist' });
    }

    res.status(200).json(playlist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 