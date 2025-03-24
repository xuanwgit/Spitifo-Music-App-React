import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import Album from '../models/albumModel.js';
import {
  getAlbums,
  getAlbum,
  createAlbum,
  deleteAlbum,
  updateAlbum,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getPublicAlbums,
  getAlbumByTitle
} from '../controllers/albumController.js';
import requireAuth from '../middleware/requireAuth.js';
import { uploadFile } from '../s3.js';
import util from 'util';
import fs from 'fs';

const unlinkFile = util.promisify(fs.unlink);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}.${file.originalname.split(".").pop()}`);
  },
});
const upload = multer({ storage });

// Public routes
router.get('/public', getPublicAlbums);

// Protected routes
router.use(requireAuth);

// Album CRUD operations
router.get('/', getAlbums);
router.get('/bytitle/:title', getAlbumByTitle);
router.get('/user', async (req, res) => {
  const user_id = req.user._id;
  try {
    const albums = await Album.find({ user_id }).sort({ createdAt: -1 });
    res.status(200).json(albums);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Handle album creation with file upload
router.post('/', upload.single('image'), async (req, res) => {
  const file = req.file;
  console.log('Uploaded file:', file);

  try {
    const result = await uploadFile("images", file);
    await unlinkFile(file.path);
    
    const { title, artist, isPublic } = req.body;
    const cover = result.Key;
    const user_id = req.user._id;

    const album = await Album.create({ 
      title, 
      artist, 
      cover, 
      isPublic: isPublic === 'true', 
      user_id,
      songs: []
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
});

// Delete album (only owner can delete)
router.delete('/:id', deleteAlbum);

// Update album (only owner can update)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such album' });
  }

  try {
    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    // Check if user owns the album
    if (album.user_id !== user_id) {
      return res.status(403).json({ error: 'Not authorized to update this album' });
    }

    const updatedAlbum = await Album.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );

    res.status(200).json(updatedAlbum);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Favorite album routes
router.post('/:id/favorite', addToFavorites);
router.delete('/:id/favorite', removeFromFavorites);
router.get('/favorites', getFavorites);

export default router;
