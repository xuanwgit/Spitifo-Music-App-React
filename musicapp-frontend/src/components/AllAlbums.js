import React from 'react'
import { useEffect, useState } from 'react';
import { useAuthContext } from "../hooks/useAuthContext";
import { Link, useNavigate } from "react-router-dom";
import API_URL from '../config';


// not finish yet
function AllAlbums() {

  const [albums, setAlbums] = useState([]);
  const [album, setAlbum] = useState([]);
  const { user } = useAuthContext();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      console.log(user);
      const response = await fetch(`${API_URL}/api/album/all`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const json = await response.json();

      if (response.ok) {
        const albums = json.map((album) => {
          let url = "https://my-musicapp-bucket.s3.us-east-1.amazonaws.com/";
          if (album.coverImage) {
            url += album.coverImage;
          } else {
            url += "default-album-cover.jpg";
          }
          return { ...album, coverImage: url };
        });
        setAlbums(albums);
      }
    };
    if (user) {
      fetchAlbums();
    }
  }, 
  [setAlbums, user]
  );

//   const handleDelete = async (_id) => {
//     // need to to delete all songs by album_Id first.

//     const response = await fetch(`/api/album/${_id}`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${user.token}`,
//       },
//     });

//     const json = await response.json();

//     if (response.ok) {
//       setAlbums(albums.filter((s) => s._id !== _id));
//     } else {
//       setError(json.error);
//     }
//   };


  return (
    <div className="container">
  
      <div className="App">
      <div className='mt-50'>
        <div className='box3'>
          <div className='h2'> Find your favourite album today!</div>
          <div className='title2 w5'></div>
        </div>
        <div className='box'>
        {albums &&
          albums.map((album) => (
            <div>
              <Link className="" to={"/myalbum/" + album._id}>
                {/* <img src={url + album.cover} alt="Pics" width="200" height="200" class="rounded float-left mt-0 ml-1 px-2 p-3" /> */}
  
                <div className='item2 bg2 '>
        <img src={album.coverImage} className="img2" />
        <div>
          <div className=' ft15 wb mt-10 '>
            {album.title}
          </div>
          <div className='txt mt-10 vtxt1'>
          {album.artist}
          </div>
        </div>
          </div>
              </Link>    
            </div>
          ))}
      </div>
    </div>
    </div>
    </div>
  );
}


export default AllAlbums;