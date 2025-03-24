import React from "react";
import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BsPlusCircle, BsTrash, BsPencil } from "react-icons/bs";
import styles from "../styles/MyAlbums.module.css";

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

function MyAlbum() {
  const { id: titleParam } = useParams();
  const [songs, setSongs] = useState([]);
  const [album, setAlbum] = useState(null);
  const { user } = useAuthContext();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!user || !user.token) {
        console.log("No user or token available");
        setError("Please log in to view this album");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/album/bytitle/${titleParam}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        const json = await response.json();

        if (response.ok) {
          console.log("Album data:", {
            albumId: json._id,
            albumUserId: json.user_id,
            albumTitle: json.title,
            currentUserId: user._id,
            fullUser: user
          });
          const isOwner = String(json.user_id) === String(user._id);
          console.log("Ownership check:", {
            albumUserId: String(json.user_id),
            currentUserId: String(user._id),
            isOwner: isOwner
          });
          setAlbum(json);
          // After getting the album, fetch its songs
          fetchSongs(json._id);
        } else {
          console.error("Failed to fetch album:", json.error);
          setError("Album not found");
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (err) {
        console.error("Error fetching album:", err);
        setError("Failed to fetch album");
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbum();
  }, [titleParam, navigate, user]);

  const fetchSongs = async (albumId) => {
    if (!user || !user.token) {
      console.log("No user or token available for fetching songs");
      return;
    }

    try {
      const response = await fetch(`/api/songs/album/${albumId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const json = await response.json();

      if (response.ok) {
        console.log("Songs data:", {
          count: json.length,
          songs: json.map(song => ({
            id: song._id,
            title: song.title
          }))
        });
        setSongs(json);
      } else {
        console.error("Failed to fetch songs:", json.error);
      }
    } catch (err) {
      console.error("Error fetching songs:", err);
      setError("Failed to fetch songs");
    }
  };

  const handleDeleteSong = async (songId) => {
    if (!user) {
      setError('You must be logged in');
      return;
    }

    const decodedToken = decodeToken(user.token);
    const userId = decodedToken ? decodedToken._id : null;

    // Check if the current user is the album owner
    const isOwner = userId && String(album.user_id) === String(userId);
    console.log("Delete song ownership check:", {
      albumUserId: String(album.user_id),
      currentUserId: userId,
      decodedToken: decodedToken,
      isOwner: isOwner
    });

    if (!isOwner) {
      setError('You are not authorized to delete songs from this album');
      return;
    }

    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const json = await response.json();

      if (response.ok) {
        setSongs(songs.filter((s) => s._id !== songId));
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError("Failed to delete song");
    }
  };

  const handleDeleteAlbum = async () => {
    if (!user) {
      setError('You must be logged in');
      return;
    }

    try {
      // Decode token to get user ID
      const decodedToken = decodeToken(user.token);
      const userId = decodedToken ? decodedToken._id : null;

      // Check if the current user is the album owner
      const isOwner = userId && String(album.user_id) === String(userId);
      console.log("Delete album ownership check:", {
        albumUserId: String(album.user_id),
        currentUserId: userId,
        decodedToken: decodedToken,
        isOwner: isOwner,
        token: user.token
      });

      if (!isOwner) {
        setError('You are not authorized to delete this album');
        return;
      }

      const response = await fetch(`/api/album/${album._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        navigate('/');
      } else {
        const json = await response.json();
        setError(json.error || 'Failed to delete album');
      }
    } catch (err) {
      console.error('Error during album deletion:', err);
      setError('Failed to delete album');
    }
  };

  // Early return if no user
  if (!user) {
    return (
      <div className="home-container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="alert custom-alert">
            <i className="bi bi-exclamation-triangle me-2"></i>Please log in to view this album
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="home-container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-light">Loading album...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="alert custom-alert">
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
          </div>
          <p className="text-light opacity-75">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="home-container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="alert custom-alert">
            <i className="bi bi-exclamation-triangle me-2"></i>Album not found
          </div>
          <p className="text-light opacity-75">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  // Also update the initial ownership check
  const decodedToken = user ? decodeToken(user.token) : null;
  const userId = decodedToken ? decodedToken._id : null;
  const isOwner = user && userId && String(album.user_id) === String(userId);

  console.log("Initial ownership check:", {
    albumUserId: album?.user_id,
    currentUserId: userId,
    decodedToken: decodedToken,
    isOwner: isOwner,
    token: user?.token
  });

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section position-relative overflow-hidden py-5">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient"></div>
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-md-4 text-center">
              <img 
                src={`https://my-musicapp-bucket.s3.us-east-1.amazonaws.com/${album.cover}`} 
                className="album-cover-large shadow" 
                alt={album.title} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x400/1DB954/ffffff?text=Album';
                }}
              />
            </div>
            <div className="col-md-8 text-md-start text-center mt-4 mt-md-0">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h1 className="display-4 text-light fw-bold mb-2">{album.title}</h1>
                  <h2 className="h4 text-light opacity-75 mb-4">By {album.artist}</h2>
                </div>
                {isOwner && (
                  <button 
                    onClick={handleDeleteAlbum}
                    className="btn btn-danger"
                    title="Delete album"
                  >
                    <BsTrash />
                  </button>
                )}
              </div>
              {isOwner && (
                <Link 
                  to={"/addsong/" + album._id}
                  className="btn custom-gradient"
                >
                  <BsPlusCircle className="me-2" />
                  Add New Song
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Songs Section */}
      <div className="container mt-5">
        <div className="row">
          <div className="col-12">
            {songs && songs.length > 0 ? (
              <div className="songs-table">
                <table className="table table-dark table-hover">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Title</th>
                      <th scope="col">Play</th>
                      {isOwner && <th scope="col">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {songs.map((song, index) => {
                      console.log(`Rendering song ${index + 1}, isOwner:`, isOwner);
                      return (
                        <tr key={song._id}>
                          <td className="text-light opacity-75">{index + 1}</td>
                          <td className="text-light">{song.title}</td>
                          <td>
                            <audio controls className="custom-audio-player">
                              <source src={`https://my-musicapp-bucket.s3.us-east-1.amazonaws.com/${song.file_url}`} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          </td>
                          {isOwner && (
                            <td className="text-center">
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm song-delete-btn d-inline-flex align-items-center justify-content-center"
                                onClick={() => handleDeleteSong(song._id)}
                                title="Delete song"
                                style={{
                                  opacity: '1',
                                  visibility: 'visible',
                                  width: '32px',
                                  height: '32px',
                                  minWidth: '32px'
                                }}
                              >
                                <BsTrash />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <p className="text-light opacity-75 mb-4">No songs in this album yet.</p>
                {isOwner && (
                  <Link to={"/addsong/" + album._id} className="btn custom-gradient">
                    <BsPlusCircle className="me-2" />
                    Add the First Song
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
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
          padding: 80px 0;
          position: relative;
          overflow: hidden;
        }

        .album-cover-large {
          width: 300px;
          height: 300px;
          object-fit: cover;
          border-radius: 8px;
          transition: transform 0.3s ease;
        }

        .album-cover-large:hover {
          transform: scale(1.02);
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
          color: white;
          text-decoration: none;
        }

        .songs-table {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .table {
          margin-bottom: 0;
        }

        .table-dark {
          background: transparent;
        }

        .table-dark td, .table-dark th {
          border-color: rgba(255, 255, 255, 0.1);
          vertical-align: middle;
        }

        .table-dark tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .table-dark tr:hover .btn-danger {
          opacity: 1;
        }

        .custom-audio-player {
          max-width: 250px;
          height: 32px;
        }

        .custom-audio-player::-webkit-media-controls-panel {
          background: rgba(29, 185, 84, 0.1);
        }

        .custom-alert {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.2);
          color: #dc3545;
          border-radius: 8px;
          padding: 1rem;
        }

        .btn-danger {
          background: transparent;
          border: none;
          color: #dc3545;
          transition: all 0.3s ease;
          padding: 8px;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
        }

        .btn-danger:hover {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          transform: scale(1.1);
          opacity: 1;
        }

        .song-delete-btn {
          background: transparent;
          border: none;
          color: #dc3545;
          transition: all 0.3s ease;
          padding: 8px;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1 !important;
        }

        .song-delete-btn:hover {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          transform: scale(1.1);
        }

        .table-dark tr .song-delete-btn {
          opacity: 1 !important;
          visibility: visible !important;
        }

        .table-dark td, .table-dark th {
          border-color: rgba(255, 255, 255, 0.1);
          vertical-align: middle;
          padding: 1rem;
        }

        @media (max-width: 768px) {
          .album-cover-large {
            width: 200px;
            height: 200px;
          }

          .hero-section {
            padding: 60px 0;
          }

          .custom-audio-player {
            max-width: 150px;
          }
        }
      `}</style>
    </div>
  );
}

export default MyAlbum;
