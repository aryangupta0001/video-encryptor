import React from 'react'
import { useState } from 'react'
import "./Home.css"

import uploadImg from "../assets/images/cloud-computing.png"

const Home = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [hexdata, setHexData] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0.0);


  const CHUNK_SIZE = 0.01 * 1024 * 1024;


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

  const arrayBufferToHex = (buffer) => {
    const byteArray = new Uint8Array(buffer);

    return byteArray.reduce((hexString, byte) => {
      return hexString + ('0' + byte.toString(16)).slice(-2);
    }, '');
  };

  const handleFileDrop = (e) => {
    e.preventDefault();

    console.log("File Dropped");

    if (e.dataTransfer.files)
      if (e.dataTransfer.files.length > 0) {
        const newFile = e.dataTransfer.files[0];

        if (newFile.type.startsWith("video/"))
          setFile(newFile);

        else
          alert("Video File Not Found");
      }
  }


  const handleFileUpload = async () => {
    setUploading(true);
    let offset = 0;
    const fileSize = file.size;
    const fileName = file.name;

    let hexResult = '';
    let processsedSize = 0;



    try{
      await fetch("http://localhost:3000/api/chunks/createvideohex", {
        method: "POST",
        headers:{
          "Content-Type":"application/json",
        },

        body: JSON.stringify({fileName, fileSize})
      });
    }

    catch(error)
    {
      alert("Some error Occured in uploading video\nCheck console");
      console.log(error);
    }

    while (offset < fileSize) {
      const chunk = file.slice(offset, (offset + CHUNK_SIZE > fileSize) ? fileSize : offset + CHUNK_SIZE);

      const arrayBuffer = await chunk.arrayBuffer();
      const hexChunk = arrayBufferToHex(arrayBuffer);

      console.log("Chunk Length  : ", hexChunk.length);
      console.log("Result Length  : ", hexResult.length);
      hexResult += hexChunk

      console.log(hexChunk);

      offset += CHUNK_SIZE;

      if (offset > fileSize)
        offset = fileSize;

      setUploadPercent(offset * 100 / fileSize);
    }


    // setUploading(false);
    setHexData(hexResult);

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
        <img src={uploadImg} alt="" onClick={() => { document.getElementById("browseFileBtn").click() }} className='cursor' />
        {/* </div> */}
        Drag & Drop to Upload File
        <br></br>
        <br></br>
        OR
        <input type="file" accept="video/*" id='browseFileBtn' style={{ display: 'none' }} onChange={handleNewFile} />

        <label htmlFor="browseFileBtn" className='button' >{file ? file.name : "Browse File"}</label>

        <div>
          {file &&
            (<>
              <p>
                Name : {file.name}
              </p>
              <p>
                Size : {(file.size / 1048576).toFixed(2)} MB
              </p>

              <button className='button mb-10' onClick={handleFileUpload} style={{ display: uploading ? "none" : "block" }} >Upload</button>

              <div style={{ display: uploading ? "block" : "none" }} className='m-auto w-70'>
                <div id="progressBar" style={{ width: `${uploadPercent}%` }}>
                  <div style={{ display: (uploadPercent < 100) ? "block" : "none" }}> Uploading... {uploadPercent.toFixed(2)}% </div>
                  <div>Upload Complete</div>
                </div>

              </div>
            </>
            )
          }

        </div >
      </div>

    </div>
  )
}
export default Home