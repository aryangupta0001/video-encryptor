import React from 'react'
import "./Home.css"
import uploadImg from "./assets/images/cloud-computing.png"
import { useState } from 'react'

const Home = () => {
  const [btnName, setBtnName] = useState("Browse");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);


  const handleNewFile = (e) => {
    console.log("Browse Button Clicked");
    setFile(e.target.files[0]);
  }

  const handleFileDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  }

  const handleDragLeave = () => {
    setDragging(false);
  }

  const handleFileDrop = (e) => {
    e.preventDefault();

    console.log("File Dropped");

    if(e.dataTransfer.files)
        if(e.dataTransfer.files.length > 0)
        { const newFile = e.dataTransfer.files[0];

          if(newFile.type.startsWith("video/"))
            setFile(newFile);

          else
            alert("Video File Not Found");
        }

  }

  return (
    <div className='body'>
      <center>
        <h1 id='title'>
          Video Encrypter
        </h1>
      </center>

      <div id="dragDrop" onDragOver={handleFileDragOver} onDragLeave={handleDragLeave} onDrop={handleFileDrop}>
        {/* <div> */}
        <img src={uploadImg} alt="" />
        {/* </div> */}
        Drag & Drop to Upload File
        <br></br>
        <br></br>
        OR
        <input type="file" accept="video/*" id='browseFileBtn' style={{ display: 'none' }} onChange={handleNewFile} />

        <label htmlFor="browseFileBtn" className='button' >{file ? file.name : "Browse File"}</label>

        <div>
        </div>

      </div>

    </div >
  )
}

export default Home
