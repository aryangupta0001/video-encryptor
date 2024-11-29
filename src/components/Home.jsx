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
  const [lockKey, setLockKey] = useState('');


  const CHUNK_SIZE = 0.025 * 1024 * 1024;
  const INSERTION_OFFSET = 1000;


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

  const convertKeyToHex = async (key) => {
    return Array.from(key) // Convert string to array of characters
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0')) // Convert each char to hex
      .join(''); // Join the hex values into a single String
  }

  const insertLockKey = async (hexChunk, lockKey) => {
    let a = [];
    let i = 0;
    let pos = 0;

    while (true) {
      if (pos + INSERTION_OFFSET <= hexChunk.length) {
        a.push(lockKey.concat(hexChunk.slice(pos, pos + INSERTION_OFFSET)));
        pos = pos + INSERTION_OFFSET;
      }

      else {
        a.push(lockKey.concat(hexChunk.slice(pos, hexChunk.length)));
        break;
      }
    }

    return a.join('');
  }

  const handleFileUpload = async () => {
    setUploading(true);
    let offset = 0;
    const fileSize = file.size;
    const fileName = file.name;

    let hexResult = '';
    let totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
    let videoId = '';



    const lockIdHex = await convertKeyToHex(lockKey);
    setLockKey(lockIdHex);

    console.log("HeX : " + lockIdHex);

    const startTime = new Date();
    console.log(`Upload started at ${startTime.toLocaleTimeString()}`)

    console.log(totalChunks + "CHUNKS");

    try {
      const response = await fetch("http://localhost:3000/api/chunks/uploadvideo", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ fileName, fileSize, totalChunks })
      });

      if (!response.ok) {
        throw new Error('Failed to upload video');
      }


      const data = await response.json();
      videoId = data.id;

    }

    catch (error) {
      alert("Some error Occured in uploading video details\nCheck console");
      console.log(error);
    }


    while (offset < fileSize) {
      const chunk = file.slice(offset, (offset + CHUNK_SIZE > fileSize) ? fileSize : offset + CHUNK_SIZE);

      const arrayBuffer = await chunk.arrayBuffer();
      const hexChunk = arrayBufferToHex(arrayBuffer);

      const saltedHexChunk = await insertLockKey(hexChunk, lockIdHex);

      try {
        const addedVideoChunk = await fetch(`http://localhost:3000/api/chunks/addvideochunks/`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ videoId: videoId, chunkData: saltedHexChunk })
        });

        const chunkData = await addedVideoChunk.json();


        console.log("Video Chunk : \t", chunkData.id);

      }

      catch (error) {
        alert("Some error Occured in uploading video chunks\nCheck console");
        console.log(error);
      }

      offset += CHUNK_SIZE;

      if (offset > fileSize)
        offset = fileSize;

      setUploadPercent(offset * 100 / fileSize);
    }

    const endTime = new Date();
    console.log(`Upload started at ${endTime.toLocaleTimeString()}`)

    console.log(`Time Taken : ${(endTime - startTime) / 1000}`);

    // setUploading(false);
    setHexData(hexResult);
  }


  const handleLockingKey = async () => {
    let key = document.getElementById('lockKeyInput').value;

    setLockKey(key);
  }

  return (
    <div className='body'>
      <center>
        <h1 id='title'>
          Video Encrypter
        </h1>
      </center>

      <div id="dragDrop" onDragOver={handleFileDragOver} onDragLeave={handleDragLeave} onDrop={handleFileDrop}>

        <img src={uploadImg} alt="" onClick={() => { document.getElementById("browseFileBtn").click() }} className='cursor' />

        Drag & Drop to Upload File
        <br></br>
        <br></br>
        OR
        <input type="file" accept="video/*" id='browseFileBtn' style={{ display: 'none' }} onChange={handleNewFile} />

        <label htmlFor="browseFileBtn" className='button cursor' >{file ? file.name : "Browse File"}</label>

        <div>
          {file &&
            (<>
              <p>
                Name : {file.name}
              </p>
              <p>
                Size : {(file.size / 1048576).toFixed(2)} MB
              </p>

              <input type="text" id='lockKeyInput' className='mb-10' placeholder='Enter Alpha-Numeric Locking Key (Max. 20 characters)' onChange={handleLockingKey} />

              <button className='button mb-10 cursor' onClick={handleFileUpload} style={{ display: lockKey.length > 0 ? "block" : "none" }} >Upload</button>

              <div style={{ display: uploading ? "block" : "none" }} className='m-auto w-70'>
                <div id="progressBarDiv">
                  <div id="progressBar" style={{ width: `${uploadPercent}%` }}>
                  </div>
                </div>

                <div style={{ display: (uploadPercent < 100) ? "block" : "none" }}> Uploading... {uploadPercent.toFixed(2)}% </div>

                <div style={{ display: (uploadPercent < 100) ? "none" : "block" }}>Upload Complete</div>

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