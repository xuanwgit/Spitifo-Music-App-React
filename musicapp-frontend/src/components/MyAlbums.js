import React from "react";
import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link } from "react-router-dom";
import { BsTrash, BsPencil, BsPlusCircle, BsPlayCircle } from "react-icons/bs";

// Function to decode JWT token
const decodeToken = (token) => {
  if (!token) {
    console.error('No token provided to decode');
    return null;
  }

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.error('Invalid token format');
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);
    console.log('Successfully decoded token:', decoded);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Helper function to format title for URL
const formatTitleForUrl = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
};

function MyAlbums() {
  const url = "https://my-musicapp-bucket.s3.us-east-1.amazonaws.com/";
  const [albums, setAlbums] = useState([]);
  const { user } = useAuthContext();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      if (!user || !user.token) {
        console.log("No user or token available yet");
        return;
      }

      console.log("Fetching albums with user:", {
        userId: user._id,
        token: user.token.substring(0, 10) + "..." // Log only part of the token for security
      });

      try {
        const response = await fetch("/api/album", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const json = await response.json();

        if (response.ok) {
          console.log("Albums fetched successfully:", {
            count: json.length,
            albums: json.map(album => ({
              id: album._id,
              title: album.title,
              userId: album.user_id
            }))
          });
          setAlbums(json);
        } else {
          console.error("Failed to fetch albums:", json);
          setError("Failed to fetch albums");
        }
      } catch (err) {
        console.error("Error fetching albums:", err);
        setError("Failed to fetch albums");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, [user]);

  const handleDelete = async (albumId) => {
    if (!user) {
      setError("You must be logged in to delete albums");
      return;
    }

    const decodedToken = decodeToken(user.token);
    const userId = decodedToken ? decodedToken._id : null;

    if (!userId) {
      setError("Authentication error");
      return;
    }

    try {
      const response = await fetch(`/api/album/${albumId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAlbums(albums.filter((album) => album._id !== albumId));
      } else {
        const json = await response.json();
        setError(json.error || "Failed to delete album");
      }
    } catch (err) {
      console.error("Error deleting album:", err);
      setError("Failed to delete album");
    }
  };

  // Debug function to check ownership
  const isOwner = (albumUserId) => {
    const decodedToken = user ? decodeToken(user.token) : null;
    const userId = decodedToken ? decodedToken._id : null;

    console.log("Checking ownership:", {
      albumUserId: String(albumUserId),
      currentUserId: userId,
      decodedToken: decodedToken,
      isMatch: String(albumUserId) === String(userId)
    });
    
    return userId && String(albumUserId) === String(userId);
  };

  // Early return if no user
  if (!user) {
    return (
      <div className="text-center text-light p-5">
        <p>Please log in to view your albums</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section position-relative overflow-hidden py-5">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient"></div>
        <div className="container position-relative">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-2 text-light fw-bold mb-4">My Albums</h1>
              <p className="lead text-light opacity-75 mb-4">Manage your personal collection of musical masterpieces</p>
              <Link to="/addalbum" className="btn custom-gradient">
                <BsPlusCircle className="me-2" />
                Add New Album
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center text-light">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading albums...</p>
          </div>
        ) : albums && albums.length > 0 ? (
          <div className="row g-4">
            {albums.map((album) => (
              <div className="col-md-4 col-lg-3" key={album._id}>
                <div className="album-card">
                  <div className="album-image-container">
                    <img
                      src={`${url}${album.cover}`}
                      alt={album.title}
                      className="album-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x400/1DB954/ffffff?text=Album';
                      }}
                    />
                    <div className="album-overlay">
                      <Link to={`/myalbum/${formatTitleForUrl(album.title)}`} className="play-button">
                        <BsPlayCircle size={48} />
                      </Link>
                      <div className="album-actions">
                        <button
                          onClick={() => handleDelete(album._id)}
                          className="delete-button"
                          title="Delete album"
                        >
                          <BsTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="album-info">
                    <h3 className="album-title">{album.title}</h3>
                    <p className="album-artist">{album.artist}</p>
                    <p className="album-owner-badge">
                      <small className="text-success">Your Album</small>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-light">
            <p>No albums found. Start by adding your first album!</p>
            <Link to="/addalbum" className="btn custom-gradient mt-3">
              <BsPlusCircle className="me-2" />
              Add New Album
            </Link>
          </div>
        )}
      </div>

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
          padding: 80px 0 60px;
          position: relative;
          overflow: hidden;
        }

        .album-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .album-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.1);
        }

        .album-image-container {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          aspect-ratio: 1;
          margin-bottom: 1rem;
        }

        .album-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.3s ease;
        }

        .album-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.2s ease;
        }

        .album-image-container:hover .album-overlay {
          opacity: 1;
        }

        .play-button {
          color: #1DB954;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
          z-index: 2;
        }

        .play-button:hover {
          transform: scale(1.1);
          color: #1ed760;
        }

        .album-actions {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          gap: 8px;
          z-index: 100;
        }

        .delete-button {
          background: #dc3545;
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          z-index: 200;
        }

        .delete-button:hover {
          background: #bb2d3b;
          transform: scale(1.1);
        }

        .album-title {
          color: white;
          font-size: 1rem;
          font-weight: 600;
          margin: 0.5rem 0 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .album-artist {
          color: #A7A7A7;
          font-size: 0.875rem;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .album-owner-badge {
          margin: 0.5rem 0 0;
          font-size: 0.75rem;
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
          transform: scale(1.02);
          background: linear-gradient(45deg, #1ed760, #1DB954);
          box-shadow: 0 8px 16px rgba(29, 185, 84, 0.3);
          color: white;
          text-decoration: none;
        }

        .alert-danger {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.2);
          color: #dc3545;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
}

export default MyAlbums;
