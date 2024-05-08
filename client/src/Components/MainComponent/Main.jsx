import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import '../MainComponent/Main.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone as Mobile, faVideo as Video, faPlus as Adduser, faPaperPlane as Send, faSmile as Emoji, faLink as Attachments, faXmark as Cancel } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export default function Main() {
  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [authorsList, setAuthors] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [text, setText] = useState("");
  let chatProfileImage = localStorage.getItem('groupProfile') || 'https://wallpapercave.com/wp/wp7433217.jpg';
  
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
    const newSocket = io();
    setSocket(newSocket);

    const savedUsername = localStorage.getItem('username');
    if (!savedUsername) 
    {
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
      }).then((result) => {
        if (result.isConfirmed) 
        {
          setUsername(result.value);
          newSocket.emit("username", result.value);
          localStorage.setItem("username", result.value);
        }
      });
    } 
    else 
    {
      setUsername(savedUsername);
      newSocket.emit("username", savedUsername);
    }

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !username) return;

    socket.on('all authors', (receivedAuthors) => {
      setAuthors(receivedAuthors);
    });

    setConnectedUsers(prevUsers => {
      const updatedUsers = [...prevUsers, username];
      return Array.from(new Set(updatedUsers));
    });

    socket.on('user joined', (newUser) => {
      setConnectedUsers(prevUsers => {
        if (newUser === username) return prevUsers;
        if (!prevUsers.includes(newUser)) {
          return [...prevUsers, newUser];
        }
        return prevUsers;
      });
    });

    socket.on('user left', (leftUser) => {
      setConnectedUsers(prevUsers => prevUsers.filter(user => user !== leftUser));
    });

    socket.on('chat message', (msg) => {
      const item = document.createElement("li");
      item.classList.add("msg-li");
      const messageAlignment = msg.author === username ? "message-right" : "message-left";
      item.classList.add(messageAlignment);
      const messageContent = msg.author === username ? msg.content : `<div class="authorStyle">${msg.author}</div>${msg.content}`;
      item.innerHTML = `<div class='msg-content'> ${messageContent}</div>`;
      if (msg.image) {
        const img = document.createElement("img");
        img.classList.add('img-style');
        img.src = msg.image;
        item.appendChild(img);
      }
      document.getElementById("messages").appendChild(item);
      scrollBottom();
    });

    socket.on('loaded messages', (messages) => {
      const messageList = document.getElementById("messages");
      messages.forEach((msg) => {
        const item = document.createElement("li");
        item.classList.add("img-li");
        item.classList.add("msg-li");
        const messageAlignment = msg.author === username ? "message-right" : "message-left";
        const messageContent = msg.author === username ? msg.content : `<div class="authorStyle">${msg.author}</div>${msg.content}`;
        item.classList.add(messageAlignment);
        item.innerHTML = `<div class='msg-content'> ${messageContent}</div>`;
        if (msg.image) {
          const img = document.createElement("img");
          img.classList.add("img-style");
          img.src = msg.image;
          item.appendChild(img);
        }
        messageList.appendChild(item);
      });
      scrollBottom();
    });
  }, [socket, username]);

  const scrollBottom = () => {
    const message = document.getElementById("messageContainer");
    message.scrollTop = message.scrollHeight;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById("text-area");
    const fileInput = document.getElementById("imageBtn");
    const file = fileInput.files[0];

    if (!file && !input.value) {
      alert("Please enter a message");
      return;
    }

    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        socket.emit("chat message", {
          author: username,
          content: input.value,
          image: reader.result
        });
        input.value = "";
        fileInput.value = "";
      };
    } else {
      socket.emit("chat message", {
        author: username,
        content: input.value,
        image: null
      });
      input.value = "";
    }
  };

  useEffect(() => {
    console.log("Authors:", authorsList);
  }, [authorsList]);

  const handleAttachments = () => {
    const fileInput = document.getElementById('imageBtn');
    fileInput.click();
  };

  const selectGroupProfile = () => {
    Swal.fire({
        title: 'Select Image for group chat',
        html: `
            <input type="file" id="imageInput" accept="image/*" style="margin-top: 10px;">
        `,
        showCancelButton: true,
        confirmButtonText: 'Select',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
            return new Promise((resolve) => {
                const fileInput = document.getElementById('imageInput');
                const file = fileInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const groupProfile = reader.result;
                        const groupName = 'chat app'; // Change this to dynamically retrieve the group name if needed
                        socket.emit('groupProfile', { groupName, groupProfile });
                        localStorage.setItem('groupProfile', groupProfile);
                        resolve();
                    };
                    reader.readAsDataURL(file);
                } else {
                    resolve();
                }
            });
        }
    });
};

  const CallPhone = () => {
    socket.emit("call user", username);
    Swal.fire({
      title: `You started video call..`,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "PROCEED",
      cancelButtonText: "CANCEL"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "JOINING...",
          text: "Connecting to the audio chat..",
          icon: "success"
        }).then(() => {
          socket.emit("chat message", { author: username, content: `Hey hi, I'm started the meeting` });
          navigate("/audio");
        })
      }
    });
  }

  const navigate = useNavigate();
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming call", (author) => {
      Swal.fire({
        title: `${author} started audio call...`,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "JOIN",
        cancelButtonText: "DECLINE"
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "JOINING...",
            text: "Connecting to the audio chat..",
            icon: "success"
          }).then(() => {
            navigate("/audio")
          })
        }
      });
    });

    return () => {
      socket.off("incoming call");
    };
  }, [socket]);

  const addEmojiToTextArea = (emoji) => {
    setText(prevText => prevText + emoji);
    const input = document.getElementById("text-area");
    input.value += emoji;
  };

  return (
    <main id="ChatApplicationContainer">
      <section id="userDetails">
        <div id='chat-profile-section' onClick={selectGroupProfile}>
          <img src={chatProfileImage} alt="chat image" id='chat-profile' />
        </div>
        <div id='chat-user-sections'>
          <label id='chat-name'>MY CHAT APP</label>
          <span id='users-div'>
            {authorsList.map((user, index) => (
              <label key={index} className="user-label">{user}{index !== authorsList.length - 1 ? ", " : ""}</label>
            ))}
          </span>
        </div>
        <div id='chat-icons-section'>
          <FontAwesomeIcon icon={Video} className='chat-icon video' onClick={CallPhone}/>
          <FontAwesomeIcon icon={Adduser} className='chat-icon adduser'/>
        </div>
      </section>
      <section id="messageContainer">
        <ul id="messages"></ul>
      </section>
      <form onSubmit={handleSubmit} id="form-container">
        <span id='text-icon-sec'>
          <input type="file" id="imageBtn" accept="image/*" />
          {!showEmoji ? <FontAwesomeIcon icon={Emoji} id='emoji-icon' onClick={() => setShowEmoji(!showEmoji)} /> : <FontAwesomeIcon icon={Cancel} id='attach-icon' onClick={() => setShowEmoji(!showEmoji)} />}
          <FontAwesomeIcon icon={Attachments} id='attach-icon' onClick={handleAttachments}/>
        </span>
        <span id='text-box-sec'>
          <input type="text" placeholder="Text here" name="" id="text-area" onChange={(e) => setText(e.target.value)} value={text}/>
        </span>
        <button type="submit" id="send-btn"><FontAwesomeIcon icon={Send} className='send-icon'/></button>
        {showEmoji && <span id='emoji-section'>
          <Picker data={data} onEmojiSelect={(emoji) => addEmojiToTextArea(emoji.native)} emojiSize={20} emojiButtonSize={28} />
        </span>}
      </form>
    </main>
  );
}