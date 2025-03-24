import React from 'react'
import axios from 'axios'
import { useState } from 'react';
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import styles from "../styles/MyAlbums.module.css";
import { Link } from "react-router-dom";
import { useAlbumsContext } from "../hooks/useAlbumsContext";

function AddAlbumForm() {
  let navigate = useNavigate();
  const { user } = useAuthContext();
  const { dispatch } = useAlbumsContext();

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [file, setFile] = useState();
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);

  async function postImage({ title, artist, image }) {
    const formData = new FormData();
    formData.append("title", title)
    formData.append("artist", artist)
    formData.append("image", image)
    formData.append("isPublic", "true")

    const result = await axios.post('/api/album', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${user.token}`,
      }
    })
    return result.data
  }

  const submit = async event => {
    event.preventDefault();

    if (!user) {
      setError("You must be logged in to upload albums");
      return;
    }

    // Validate all required fields
    const emptyFieldsList = [];
    if (!title) emptyFieldsList.push('title');
    if (!artist) emptyFieldsList.push('artist');
    if (!file) emptyFieldsList.push('cover');

    if (emptyFieldsList.length > 0) {
      setEmptyFields(emptyFieldsList);
      setError("Please fill in all required fields");
      return;
    }

    try {
      const result = await postImage({ title, artist, image: file })
      
      if (result) {
        // Update the albums context
        dispatch({ type: 'CREATE_ALBUM', payload: result });
        
        // Reset form
        setEmptyFields([]);
        setTitle("");
        setArtist("");
        setFile("");
        setError(null);
        
        // Navigate to my albums page
        navigate('/myalbums');
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error uploading album");
      setEmptyFields(err.response?.data?.emptyFields || []);
    }
  }

  const fileSelected = event => {
    const file = event.target.files[0]
    setFile(file)
  }

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Please <Link to="/login">login</Link> to upload albums.
        </div>
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
              <h1 className="display-2 text-light fw-bold mb-4">Create Your Legacy</h1>
              <p className="lead text-light opacity-75 mb-4">Share your sonic masterpiece with the world</p>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="form-container">
                <form onSubmit={submit} className="album-form">
                  <div className="mb-4">
                    <label htmlFor="albumTitle" className="form-label">
                      <i className="bi bi-music-note me-2"></i>Album Title
                    </label>
                    <input
                      id="albumTitle"
                      type="text"
                      className={`form-control ${emptyFields.includes('title') ? 'is-invalid' : ''}`}
                      onChange={e => setTitle(e.target.value)}
                      value={title}
                      placeholder="Enter your album's title"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="albumArtist" className="form-label">
                      <i className="bi bi-person-circle me-2"></i>Artist
                    </label>
                    <input
                      id="albumArtist"
                      type="text"
                      className={`form-control ${emptyFields.includes('artist') ? 'is-invalid' : ''}`}
                      onChange={e => setArtist(e.target.value)}
                      value={artist}
                      placeholder="Who created this masterpiece?"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="albumCover" className="form-label">
                      <i className="bi bi-image me-2"></i>Album Artwork
                    </label>
                    <div className="upload-container">
                      <input
                        id="albumCover"
                        type="file"
                        className={`form-control ${emptyFields.includes('cover') ? 'is-invalid' : ''}`}
                        accept="image/*"
                        onChange={fileSelected}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger">
                      <i className="bi bi-exclamation-triangle me-2"></i>{error}
                    </div>
                  )}

                  <button type="submit" className="btn custom-gradient w-100">
                    <i className="bi bi-cloud-upload me-2"></i>Upload Album
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 400px;
          background: radial-gradient(circle at center, 
            rgba(29, 185, 84, 0.15) 0%,
            rgba(29, 185, 84, 0.05) 45%,
            rgba(18, 18, 18, 0) 100%
          );
          animation: pulse 15s infinite;
        }

        .display-2 {
          font-size: 3.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          background: linear-gradient(to right, #FFFFFF 0%, #A7A7A7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
        }

        .lead {
          font-size: 1.25rem;
          font-weight: 400;
          letter-spacing: -0.01em;
          opacity: 0.85;
        }

        .form-section {
          position: relative;
          z-index: 1;
        }

        .form-container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .form-label {
          color: white;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }

        .form-control {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          padding: 0.75rem 1rem;
          transition: all 0.3s cubic-bezier(0.3, 0, 0.2, 1);
        }

        .form-control:focus {
          background: rgba(255, 255, 255, 0.1);
          border-color: #1DB954;
          box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.2);
          outline: none;
        }

        .form-control::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .form-control.is-invalid {
          border-color: #dc3545;
          box-shadow: none;
        }

        .upload-container {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.3, 0, 0.2, 1);
        }

        .upload-container:hover {
          transform: translateY(-2px);
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
          margin-top: 1rem;
        }
        
        .custom-gradient:hover {
          transform: scale(1.02);
          background: linear-gradient(45deg, #1ed760, #1DB954);
          box-shadow: 0 8px 16px rgba(29, 185, 84, 0.3);
        }

        .alert-danger {
          background: rgba(220, 53, 69, 0.1) !important;
          border: 1px solid rgba(220, 53, 69, 0.2);
          color: #dc3545 !important;
          border-radius: 8px;
          padding: 1rem;
          font-weight: 500;
          margin-bottom: 1rem;
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
      `}</style>
    </div>
  )
}

export default AddAlbumForm;











// import React, { useRef } from 'react'
// import axios from 'axios'
// import { useState } from 'react';
// import { useAuthContext } from "../hooks/useAuthContext";
// import { useNavigate } from "react-router-dom";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import * as Yup from 'yup';
// import styles from "../styles/MyAlbums.module.css";
// // import { useForm } from "react-hook-form";


// // need to sovle file upload validation
// function AddAlbumForm() {
//   let navigate = useNavigate();
//   const { user } = useAuthContext();
//   // const {register, handleSubmit}= useForm()
//   const fileRef = useRef(null);

//   const [title, setTitle] = useState("");
//   const [artist, setArtist] = useState("");
//   const [file, setFile] = useState();
//   const [images, setImages] = useState([]);
//   const [error, setError] = useState(null);
//   const [emptyFields, setEmptyFields] = useState([]);

//   const initialValues = {
//     title: "",
//     artist: "",
//     file: null,

//   };

//   const validationSchema = Yup.object().shape({
//     title: Yup.string().min(1).max(50).required("Title is required"),
//     artist: Yup.string().min(1).max(50).required("Artist is required"),
//     file: Yup
//       .mixed()

//       .nullable()
//     // .required("Cover is required")
//     // .test(
//     //   "FILE_SIZE",
//     //   "Uploaded file is too big.",
//     //   (value) => !value || (value && value.size <= 1024 * 1024)
//     // ),


//   });

//   async function postImage({ title, artist, image }) {
//     const formData = new FormData();
//     formData.append("title", title)
//     formData.append("artist", artist)
//     formData.append("image", image)

//     const result = await axios.post('http://localhost:4000/api/albumtest/', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         Authorization: `Bearer ${user.token}`,
//       }
//     })

//     return result.data
//   }


//   const submit = async event => {
//     // event.preventDefault();

//     if (!user) {
//       setError("You must be logged in");
//       return;
//     }

//     const result = await postImage({ title, artist, image: file })
//     setImages([result.image, ...images]);


//     const json = await result.json;

//     if (!result) {
//       setError(result.error);
//       console.log(result.error);
//       setEmptyFields(result.emptyFields);
//       console.log(result.emptyFields);
//     }
//     if (result) {

//       setEmptyFields([]);
//       setTitle("");
//       setArtist("");
//       setFile("");
//       setError(null);
//       //dispatch({ type: "CREATE_SONG", payload: json });
//       navigate(`/myalbums`);

//     }


//   }

//   const fileSelected = event => {
//     const file = event.target.files[0];
//     setFile(file);
//   }


//   return (
//     <div className="App app">
//       <Formik initialValues={initialValues} onSubmit={submit} validationSchema={validationSchema}>
//         <div>
//           <h3 className="center" >Add a new album</h3>

//           <Form >
//             <div>
//               <label htmlFor="title">Album Title:</label>
//               <Field
//                 autoComplete="off"
//                 type="text"
//                 name="title"
//                 id="title"
//                 className={emptyFields.includes("title") ? "error" : ""}
//               />
//               <div>
//                 <ErrorMessage className={styles.error + ' text-end mb-2'} name="title" component="span" />
//               </div>
//             </div>

//             <div>

//               <label htmlFor="artist">Artist:</label>
//               <Field
//                 autoComplete="off"
//                 type="text"
//                 name="artist"
//                 id="artist"
//                 className={emptyFields.includes("artist") ? "error" : ""}
//               />
//               <div>
//                 <ErrorMessage className={styles.error + ' text-end mb-2'} name="artist" component="span" />
//               </div>
//             </div>
//             {/* <div>
//               <input ref={register} type="file" name="picture" />
//             </div> */}

//             <div>
//               <label htmlFor="cover">Cover Picture:</label>
//               <input
//                 ref={fileRef}
//                 type="file"
//                 name="file"
//                 accept="image/*"
//                 onChange={fileSelected} />
//               <div>
//                 <ErrorMessage className={styles.error + ' text-end mb-2'} name="file" component="span" />
//               </div>

//             </div>
//             <div className="center">

//               <button type="submit">Add New Album</button>
//             </div>
//             {error && <div className="error">{error}</div>}

//           </Form>
//         </div>


//       </Formik>

//     </div>
//   );
// }

// export default AddAlbumForm;



