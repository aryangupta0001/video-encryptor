import React from 'react'
import "./Home.css"
import uploadImg from "./assets/images/cloud-computing.png"

const Home = () => {
  return (
    <div className='body'>
      <center>
        <h1 id='title'>
          Video Encrypter
        </h1>
      </center>

      <div id="dragDrop">
        {/* <div> */}
          <img src={uploadImg} alt="" />
        {/* </div> */}
        Drag & Drop to Upload File
        <br></br>
        OR
        <br></br>
        <button>
          Browse File
        </button>
      </div>

    </div>
  )
}

export default Home
