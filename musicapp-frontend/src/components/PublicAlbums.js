import React, { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link } from "react-router-dom";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import styles from "../styles/MyAlbums.module.css";

function PublicAlbums() {
  const [publicAlbums, setPublicAlbums] = useState([]);
  const [favoriteAlbums, setFavoriteAlbums] = useState([]);
  const { user } = useAuthContext();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicAlbums = async () => {
      const response = await fetch("/api/albums/public");
      const json = await response.json();

      if (response.ok) {
        setPublicAlbums(json);
      } else {
        setError(json.error);
      }
    };

    const fetchFavoriteAlbums = async () => {
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

    fetchPublicAlbums();
    fetchFavoriteAlbums();
  }, [user]);

  const toggleFavorite = async (albumId) => {
    if (!user) {
      setError("Please log in to favorite albums");
      return;
    }

    const response = await fetch(`/api/album/${albumId}/favorite`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    if (response.ok) {
      // Handle successful favorite toggle
    } else {
      setError("Failed to toggle favorite");
    }
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
}

export default PublicAlbums;