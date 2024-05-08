import React, { useState, useEffect } from 'react';
import './Side.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle as CircleSolid, faPen as Edit } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
const OtherUserComponent = ({ userName }) => {
  return (
    <section id='otherUsers'>
      <div id='otherUserImgSec'>
        <div>
          <img src="https://cdn-icons-png.flaticon.com/512/9187/9187604.png" alt="" />
        </div>
      </div>
      <div id='otherUserNameSec'>
        <h1>{userName}</h1>
      </div>
      <div id='otherUserActiveSec'>
        <span>
          Active
          <FontAwesomeIcon icon={CircleSolid} className='activeCircle' />
        </span>
      </div>
    </section>
  );
};

const ImageModal = ({ closeModal, imageUrl, setImageUrl }) => 
{
  const changeProfile = () => {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();

    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImageUrl = e.target.result;
          setImageUrl(newImageUrl);
          localStorage.setItem("profile", newImageUrl); // Store the new image URL in localStorage
        };
        reader.readAsDataURL(file);
      }
    });
  };

  return (
    <div className="modal">
      <span className="close" onClick={closeModal}>&times;</span>
      <div className="modal-content">
        <img src={imageUrl} alt="Full Size" />
        <section id='edit-icon'>
          <input type="file" id="fileInput" accept="image/*" style={{'display': 'none'}} />
          <FontAwesomeIcon icon={Edit} onClick={changeProfile}/>
        </section>
      </div>
    </div>
  );
};

export default function Side(props) {
  const myName = localStorage.getItem("username");
  const [myUpdatedName, setMyName] = useState(myName);
  const [truncatedDescription, setTruncatedDescription] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(localStorage.getItem("profile") || "https://wallpapercave.com/wp/wp13651220.jpg");

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    setMyName(localStorage.getItem("username"))
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const maxLength = 20;
    const text = `Myself ${myName} i'm working withredref fhurehewxb`;

    if (text.length > maxLength) {
      setTruncatedDescription(`${text.substring(0, maxLength)}...`);
    } else {
      setTruncatedDescription(text);
    }
  }, [myName]);

  const editProfile = () => {
    Swal.fire({
      title: "Enter username",
      input: "text",
      inputLabel: "Username",
      inputPlaceholder: "Enter your username",
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (!value) {
          return "You need to enter a username";
        }
      },
      confirmButtonText: "Enter chat",
      showLoaderOnConfirm: true,
    })
      .then((result) => {
        if (result.isConfirmed) {
          const newUsername = result.value;
          localStorage.setItem("username", newUsername);
          setMyName(newUsername); // Update the displayed name
        }
      });
  };

  return (
    <div id='container'>
      <div id='mySection'>
        <div id='myProfileSection'>
          <div id='myImage' onClick={openModal}>
            <img src={imageUrl} alt="" />
          </div>
        </div>
        <div id='myNameSection'>
          <section id='myName'>
            <label>{myUpdatedName}</label>
          </section>
          <section id='myDescription'>
            <p>{truncatedDescription}</p>
          </section>
        </div>
        <div id='myIconSection'>
          <FontAwesomeIcon icon={Edit} id='myselfEdit' onClick={editProfile} />
        </div>
      </div>
      <div id='otherSection'>
        <h2 style={{color:'whitesmoke'}}>Active Users:</h2>
        {props.connectedUsers.map((user, index) => (
          <OtherUserComponent key={index} userName={user} />
        ))}
      </div>

      {showModal && <ImageModal closeModal={closeModal} imageUrl={imageUrl} setImageUrl={setImageUrl} />}
    </div>
  );
}
