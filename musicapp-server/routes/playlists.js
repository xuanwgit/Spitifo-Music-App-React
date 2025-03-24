import express from 'express';
import {
  getPlaylists,
  getPlaylist,
  createPlaylist,
  deletePlaylist,
  updatePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
} from '../controllers/playlistController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// All playlist routes require authentication
router.use(requireAuth);

// Playlist CRUD operations
router.get('/', getPlaylists);
router.get('/:id', getPlaylist);
router.post('/', createPlaylist);
router.delete('/:id', deletePlaylist);
router.patch('/:id', updatePlaylist);

// Playlist song operations
router.post('/:id/songs', addSongToPlaylist);
router.delete('/:id/songs/:songId', removeSongFromPlaylist);

export default router;
