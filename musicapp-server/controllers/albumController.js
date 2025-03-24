import Album from '../models/albumModel.js';
import mongoose from 'mongoose';

// Get all albums
export const getAlbums = async (req, res) => {
  const user_id = req.user._id;
  try {
    const albums = await Album.find({ user_id }).sort({ createdAt: -1 });
    res.status(200).json(albums);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get public albums
export const getPublicAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ isPublic: true }).sort({ createdAt: -1 });
    res.status(200).json(albums);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single album
export const getAlbum = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such album' });
  }

  try {
    const album = await Album.findById(id).populate('songs');
    if (!album) {
      return res.status(404).json({ error: 'No such album' });
    }
    res.status(200).json(album);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create a new album
export const createAlbum = async (req, res) => {
  const { title, artist, cover, isPublic } = req.body;
  const user_id = req.user._id;

  try {
    const album = await Album.create({ 
      title, 
      artist, 
      cover, 
      isPublic, 
      user_id,
      songs: [] // Initialize empty songs array
    });

    // Update user's albums array
    await mongoose.model('User').findByIdAndUpdate(
      user_id,
      { $push: { albums: album._id } }
    );

    res.status(201).json(album);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an album
export const deleteAlbum = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such album' });
  }

  const album = await Album.findOneAndDelete({ _id: id, user_id });

  if (!album) {
    return res.status(404).json({ error: 'No such album' });
  }

  res.status(200).json(album);
};

// Update an album
export const updateAlbum = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such album' });
  }

  const album = await Album.findOneAndUpdate(
    { _id: id, user_id },
    { ...req.body },
    { new: true }
  );

  if (!album) {
    return res.status(404).json({ error: 'No such album' });
  }

  res.status(200).json(album);
};

// Get user's favorite albums
export const getFavorites = async (req, res) => {
  const user_id = req.user._id;
  try {
    const albums = await Album.find({ favorites: user_id }).sort({ createdAt: -1 });
    res.status(200).json(albums);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add album to favorites
export const addToFavorites = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such album' });
  }

  try {
    const album = await Album.findByIdAndUpdate(
      id,
      { $addToSet: { favorites: user_id } },
      { new: true }
    );

    if (!album) {
      return res.status(404).json({ error: 'No such album' });
    }

    res.status(200).json(album);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove album from favorites
export const removeFromFavorites = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such album' });
  }

  try {
    const album = await Album.findByIdAndUpdate(
      id,
      { $pull: { favorites: user_id } },
      { new: true }
    );

    if (!album) {
      return res.status(404).json({ error: 'No such album' });
    }

    res.status(200).json(album);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get album by title
export const getAlbumByTitle = async (req, res) => {
  const { title } = req.params;
  
  try {
    // Find all albums and then filter to find the one that matches the formatted title
    const albums = await Album.find().populate('songs').lean();
    const album = albums.find(a => {
      const formattedAlbumTitle = a.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      return formattedAlbumTitle === title;
    });
    
    if (!album) {
      return res.status(404).json({ error: 'No such album' });
    }

    // Convert user_id to string for consistent comparison
    album.user_id = String(album.user_id);
    
    res.status(200).json(album);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 