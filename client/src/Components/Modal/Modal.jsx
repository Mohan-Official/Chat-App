import React from 'react'

export default function Modal() {
  return (
    <>
        <div className="modal">
            <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <img src="https://wallpapercave.com/wp/wp13651220.jpg" alt="Full Size" />
            </div>
        </div>
    </>
  )
}
