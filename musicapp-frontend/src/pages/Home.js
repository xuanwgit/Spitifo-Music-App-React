import { useEffect, useState } from "react";
import { useSongsContext } from "../hooks/useSongsContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link } from "react-router-dom";
import { BsHeart, BsHeartFill, BsPlayCircle, BsPlusCircle } from "react-icons/bs";
import styles from "../styles/MyAlbums.module.css";

// Helper function to format title for URL
const formatTitleForUrl = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
};

function Home() {
  const [publicAlbums, setPublicAlbums] = useState([]);
  const { user } = useAuthContext();
  const [error, setError] = useState(null);
  const [favoriteAlbums, setFavoriteAlbums] = useState([]);

  // Fetch public albums
  useEffect(() => {
    const fetchPublicAlbums = async () => {
      const response = await fetch("/api/album/public");
      const json = await response.json();

      if (response.ok) {
        setPublicAlbums(json);
      } else {
        setError(json.error);
      }
    };

    fetchPublicAlbums();
  }, []);

  // Fetch user's favorite albums if logged in
  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const response = await fetch("/api/album/favorites", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const json = await response.json();

        if (response.ok) {
          setFavoriteAlbums(json);
        }
      }
    };

    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // Handle album deletion
  const handleDelete = async (albumId) => {
    if (!user) {
      setError("You must be logged in to delete albums");
      return;
    }

    const response = await fetch(`/api/albums/${albumId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${user.token}`,
      }
    });

    const json = await response.json();

    if (response.ok) {
      // Remove album from public albums list
      setPublicAlbums(publicAlbums.filter(album => album._id !== albumId));
      // Remove from favorites if it was favorited
      setFavoriteAlbums(favoriteAlbums.filter(album => album._id !== albumId));
    } else {
      setError(json.error);
    }
  };

  const toggleFavorite = async (albumId) => {
    if (!user) {
      // Redirect or show login prompt
      return;
    }

    try {
      const response = await fetch(`/api/albums/${albumId}/favorite`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        // Update the albums list to reflect the new favorite status
        setPublicAlbums(publicAlbums.map(album => {
          if (album._id === albumId) {
            const isFavorited = album.favorites?.includes(user._id);
            if (isFavorited) {
              album.favorites = album.favorites.filter(id => id !== user._id);
            } else {
              album.favorites = [...(album.favorites || []), user._id];
            }
          }
          return album;
        }));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section position-relative overflow-hidden py-5">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient"></div>
        <div className="container position-relative">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-2 text-light fw-bold mb-4">Welcome to Spitifo</h1>
              <p className="lead text-light opacity-75 mb-4">Discover and share amazing music</p>
              {!user ? (
                <div className="d-flex gap-3 justify-content-center">
                  <Link to="/login" className="btn custom-gradient">
                    Login
                  </Link>
                  <Link to="/signup" className="btn btn-outline-light">
                    Sign Up
                  </Link>
                </div>
              ) : (
                <Link to="/addalbum" className="btn custom-gradient">
                  <BsPlusCircle className="me-2" />
                  Upload New Album
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Albums Section */}
      <div className="albums-section py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-light mb-0">Featured Albums</h2>
          </div>
          
          <div className="row g-4">
            {publicAlbums.map((album) => (
              <div className="col-md-4 col-lg-3" key={album._id}>
                <div className="album-card">
                  <div className="album-image-container">
                    <img
                      src={`https://my-musicapp-bucket.s3.us-east-1.amazonaws.com/${album.cover}`}
                      className="album-image"
                      alt={album.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x400/1DB954/ffffff?text=Album';
                      }}
                    />
                    <div className="album-overlay">
                      <Link to={`/myalbum/${formatTitleForUrl(album.title)}`} className="play-button">
                        <BsPlayCircle size={48} />
                      </Link>
                    </div>
                  </div>
                  <div className="album-info">
                    <h5 className="album-title">{album.title}</h5>
                    <p className="album-artist">{album.artist}</p>
                    <div className="album-actions">
                      {user && (
                        <button
                          className="btn btn-link favorite-btn"
                          onClick={() => toggleFavorite(album._id)}
                          title={album.favorites?.includes(user._id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          {album.favorites?.includes(user._id) ? (
                            <BsHeartFill className="text-success" />
                          ) : (
                            <BsHeart />
                          )}
                        </button>
                      )}
                      {user && user._id === album.user_id && (
                        <button
                          className="btn btn-link delete-btn"
                          onClick={() => handleDelete(album._id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User's Favorites Section - Only shown when logged in */}
      {user && favoriteAlbums.length > 0 && (
        <div className="favorites-section py-5">
          <div className="container">
            <h2 className="text-light mb-4">Your Favorites</h2>
            <div className="row g-4">
              {favoriteAlbums.map((album) => (
                <div className="col-md-4 col-lg-3" key={album._id}>
                  <div className="album-card">
                    <div className="album-image-container">
                      <img
                        src={`https://my-musicapp-bucket.s3.us-east-1.amazonaws.com/${album.cover}`}
                        className="album-image"
                        alt={album.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x400/1DB954/ffffff?text=Album';
                        }}
                      />
                      <div className="album-overlay">
                        <Link to={`/myalbum/${formatTitleForUrl(album.title)}`} className="play-button">
                          <BsPlayCircle size={48} />
                        </Link>
                      </div>
                    </div>
                    <div className="album-info">
                      <h5 className="album-title">{album.title}</h5>
                      <p className="album-artist">{album.artist}</p>
                      <button
                        className="btn btn-link favorite-btn"
                        onClick={() => toggleFavorite(album._id)}
                      >
                        <BsHeartFill className="text-success" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-25 text-light border-0 m-3">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
        </div>
      )}

      <style>{`
        .home-container {
          min-height: 100vh;
          background: #121212;
          font-family: 'Circular Std', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .bg-gradient {
          background: linear-gradient(to bottom, 
            rgba(18, 18, 18, 0) 0%,
            #121212 100%
          ), 
          linear-gradient(to right, 
            #1DB954 0%, 
            #191414 100%
          );
          opacity: 0.95;
          mix-blend-mode: overlay;
        }

        .hero-section {
          padding: 140px 0 100px;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 500px;
          background: radial-gradient(circle at center, 
            rgba(29, 185, 84, 0.15) 0%,
            rgba(29, 185, 84, 0.05) 45%,
            rgba(18, 18, 18, 0) 100%
          );
          animation: pulse 15s infinite;
        }

        .display-2 {
          font-size: 6rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1;
          background: linear-gradient(to right, #FFFFFF 0%, #A7A7A7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1.5rem;
        }

        .lead {
          font-size: 1.5rem;
          font-weight: 400;
          letter-spacing: -0.02em;
        }

        .custom-gradient {
          background: linear-gradient(45deg, #1DB954, #169C46);
          border: none;
          transition: all 0.3s cubic-bezier(0.3, 0, 0.2, 1);
          color: white;
          font-weight: 600;
          letter-spacing: 0.1px;
          padding: 12px 32px;
          border-radius: 500px;
        }
        
        .custom-gradient:hover {
          transform: scale(1.04);
          background: linear-gradient(45deg, #1ed760, #1DB954);
          box-shadow: 0 8px 16px rgba(29, 185, 84, 0.3);
        }

        .btn-outline-light {
          border-radius: 500px;
          padding: 12px 32px;
          font-weight: 600;
          letter-spacing: 0.1px;
          transition: all 0.3s cubic-bezier(0.3, 0, 0.2, 1);
        }

        .btn-outline-light:hover {
          transform: scale(1.04);
          box-shadow: 0 8px 16px rgba(255, 255, 255, 0.1);
        }

        .album-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.3, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .album-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .album-image-container {
          position: relative;
          padding-top: 100%;
          overflow: hidden;
        }

        .album-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s cubic-bezier(0.3, 0, 0.2, 1);
        }

        .album-card:hover .album-image {
          transform: scale(1.05);
        }

        .album-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.3, 0, 0.2, 1);
        }

        .album-card:hover .album-overlay {
          opacity: 1;
          background: rgba(0, 0, 0, 0.7);
        }

        .play-button {
          background: #1DB954;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s cubic-bezier(0.3, 0, 0.2, 1);
        }

        .album-card:hover .play-button {
          opacity: 1;
          transform: translateY(0);
        }

        .play-button:hover {
          transform: scale(1.1);
          background: #1ed760;
          box-shadow: 0 8px 16px rgba(29, 185, 84, 0.3);
        }

        .album-info {
          padding: 1rem;
        }

        .album-title {
          color: white;
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          transition: color 0.3s ease;
        }

        .album-artist {
          color: rgba(255, 255, 255, 0.7);
          margin: 0.3rem 0;
          font-size: 0.875rem;
          font-weight: 400;
        }

        .album-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
        }

        .favorite-btn, .delete-btn {
          color: rgba(255, 255, 255, 0.7);
          padding: 8px;
          border-radius: 50%;
          transition: all 0.3s cubic-bezier(0.3, 0, 0.2, 1);
        }

        .favorite-btn:hover, .delete-btn:hover {
          color: #1DB954;
          background: rgba(29, 185, 84, 0.1);
          transform: scale(1.1);
        }

        .text-success {
          color: #1DB954 !important;
        }

        .albums-section, .favorites-section {
          background: #121212;
          position: relative;
        }

        .albums-section h2, .favorites-section h2 {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 2rem;
        }

        @keyframes pulse {
          0% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
        }

        /* Alert styling */
        .alert-danger {
          background: rgba(29, 185, 84, 0.1) !important;
          border: 1px solid rgba(29, 185, 84, 0.2);
          color: #1DB954 !important;
          border-radius: 8px;
          padding: 1rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .display-2 {
            font-size: 3rem;
          }

          .lead {
            font-size: 1.25rem;
          }

          .hero-section {
            padding: 100px 0 80px;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
