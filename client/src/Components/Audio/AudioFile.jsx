import React, { useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import './Audio.css';

export default function Audio() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

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
    if (!containerRef.current) return;

    const myMeeting = async () => {
      const appID = 1530807756;
      const serverSecret = "75858c85b7dd0ad32529868ef32f77dd";
      const roomId = "062710";
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        Date.now().toString(),
        "Mohan"
      );

      const zc = ZegoUIKitPrebuilt.create(kitToken);
      zc.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: "Copy Meeting Link",
            url: "https://localhost:3000/audio"
          }
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showScreenSharingButton: true,
      });
    };

    myMeeting();

    return () => {
      // Clean up Zego UIKit Prebuilt instance if needed
    };
  }, []);

  const cancelCall = () => {
    Swal.fire({
      title: "RETURNING TO CHAT",
      text: "Getting back to chat page...",
      icon: "warning"
    }).then(() => {
      navigate("/");
    });
  };

  return (
    <div id='audio-container'>
      <div ref={containerRef} id='call-container'></div>
      <button onClick={cancelCall} id='BackCallBtn'>Back to chat</button>
    </div>
  );
}
