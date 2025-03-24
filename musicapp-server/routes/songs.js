import express from 'express';
import {
  getSongs,
  getSong,
  createSong,
  deleteSong,
  updateSong,
  getAlbumSongs
} from '../controllers/songController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// Public routes
router.get('/album/:albumId', getAlbumSongs);
router.get('/:id', getSong);

// Protected routes
router.use(requireAuth);
router.get('/', getSongs);
router.post('/', createSong);
router.delete('/:id', deleteSong);
router.patch('/:id', updateSong);

export default router;
