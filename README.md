# Spitifo Music App

A modern web application for music streaming and album management, built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🎵 Features

- **User Authentication**
  - Sign up and login functionality
  - JWT-based authentication
  - Role-based access control (User/Admin)

- **Album Management**
  - Upload and manage music albums
  - Add album artwork
  - Set public/private visibility
  - Add songs to albums

- **Music Streaming**
  - Stream songs from albums
  - Create and manage playlists
  - Favorite albums functionality

- **Admin Features**
  - User management
  - Content moderation
  - System monitoring

## 🚀 Live Demo

- Frontend: [https://xuanwgit.github.io/Spitifo-Music-App-React](https://xuanwgit.github.io/Spitifo-Music-App-React)
- Backend: [https://spitifo-backend.onrender.com](https://spitifo-backend.onrender.com)

## 🛠️ Technologies Used

### Frontend
- React.js
- React Router DOM
- Bootstrap & React Bootstrap
- React Icons
- Axios for API calls
- AWS SDK for S3 integration

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT for authentication
- Multer for file uploads
- AWS S3 for file storage
- CORS for cross-origin requests

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xuanwgit/Spitifo-Music-App-React.git
   cd Spitifo-Music-App-React
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd musicapp-frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../musicapp-server
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` files in both frontend and backend directories:

   Frontend `.env`:
   ```
   REACT_APP_API_URL=http://localhost:4000
   ```

   Backend `.env`:
   ```
   PORT=4000
   DATABASE_URL=your_mongodb_url
   SECRET=your_jwt_secret
   AWS_BUCKET_NAME=your_s3_bucket_name
   AWS_BUCKET_REGION=your_s3_region
   AWS_ACCESS_KEY=your_aws_access_key
   AWS_SECRET_KEY=your_aws_secret_key
   ```

5. **Start the Application**

   Frontend:
   ```bash
   cd musicapp-frontend
   npm start
   ```

   Backend:
   ```bash
   cd musicapp-server
   npm start
   ```

## 🔑 Environment Variables

The application requires several environment variables to function properly:

- `DATABASE_URL`: MongoDB connection string
- `SECRET`: JWT secret key
- `AWS_BUCKET_NAME`: S3 bucket name for file storage
- `AWS_BUCKET_REGION`: AWS region
- `AWS_ACCESS_KEY`: AWS access key
- `AWS_SECRET_KEY`: AWS secret key

## 🚀 Deployment

### Frontend
The frontend is deployed to GitHub Pages:
```bash
npm run deploy
```

### Backend
The backend is deployed to Render:
1. Connect your GitHub repository
2. Set up environment variables
3. Deploy with Node.js configuration

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

- [xuanwgit](https://github.com/xuanwgit)

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, please open an issue in the GitHub repository.
