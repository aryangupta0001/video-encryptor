import React from 'react'
import "./Home.css"
import uploadImg from "./assets/images/cloud-computing.png"
import { useState } from 'react'

const Home = () => {
  const [btnName, setBtnName] = useState("Browse");
  const [file, setFile] = useState(null);


  const handleNewFile = (e) => {
    console.log("Browse Button Clicked");
    setFile(e.target.files[0]);
  }

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
        <br></br>
        OR
        <input type="file" id='browseFileBtn' style={{ display: 'none' }} onChange={handleNewFile} />

        <label htmlFor="browseFileBtn" className='button' >{file ? file.name : "Browse File"}</label>

      <div>
      </div>

    </div>

    </div >
  )
}

export default Home
