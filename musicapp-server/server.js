import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import util from 'util';
import multer from 'multer';

import requireAuth from './middleware/requireAuth.js';
import Album from './models/albumModel.js';
import Song from './models/songModel.js';
import { uploadFile, getFileStream } from './s3.js';

import songRoutes from './routes/songs.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admins.js';
import albumRoutes from './routes/albums.js';
import playlistRoutes from './routes/playlists.js';

const unlinkFile = util.promisify(fs.unlink);

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

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://xuanwgit.github.io'],
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// API Routes
app.use("/api/songs", songRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/album", albumRoutes);
app.use("/api/playlist", playlistRoutes);

// Album upload endpoint
app.use(
  "/api/albumtest",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    const file = req.file;
    console.log('Uploaded file:', file);

    try {
      const result = await uploadFile("images", file);
      await unlinkFile(file.path);
      
      const { title, artist } = req.body;
      const cover = result.Key;
      const user_id = req.user._id;

      let emptyFields = [];
      if (!title) emptyFields.push("title");
      if (!cover) emptyFields.push("cover");
      if (!artist) emptyFields.push("artist");

      if (emptyFields.length > 0) {
        return res
          .status(400)
          .json({ error: "Please fill in all fields", emptyFields });
      }

      const album = await Album.create({ title, artist, cover, user_id });
      res.status(201).json(album);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Song upload endpoint
app.use(
  "/api/createsong",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    const file = req.file;
    console.log('Uploaded file:', file);

    try {
      const result = await uploadFile("songs", file);
      await unlinkFile(file.path);

      const { title, albumId: album_id } = req.body;
      const file_url = result.Key;

      // Create the song
      const song = await Song.create({ title, album_id, file_url });

      // Update the album's songs array
      await Album.findByIdAndUpdate(
        album_id,
        { $push: { songs: song._id } }
      );

      res.status(201).json(song);
    } catch (error) {
      console.error('Error creating song:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Connected to DB and listening on port ${process.env.PORT}!!`);
    });
  })
  .catch((error) => {
    console.log('Database connection error:', error);
  });
