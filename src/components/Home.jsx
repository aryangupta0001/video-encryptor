import React from 'react'
import { useState } from 'react'
import "./Home.css"

import uploadImg from "../assets/images/cloud-computing.png"

const Home = () => {
  const [btnName, setBtnName] = useState("Browse");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [hexdata, setHexData] = useState('');

  const CHUNK_SIZE = 0.01*1024*1024;


  const handleNewFile = (e) => {
    console.log("Browse Button Clicked");
    setFile(e.target.files[0]);
  }

  const handleFileDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  }

  const handleDragLeave = ()  => {
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

  // const handleFileUpload = (e) => {
  //   let reader = new FileReader();
  //   reader.onload = (e) => {
  //     const binaryData = e.target.result;


  //     // const hexRep = convertToHex(binaryData);

  //     console.log(binaryData);
  //   }

  //   reader.readAsArrayBuffer(file);
  // }

  const handleFileUpload = async () => {
    let offset = 0;
    const fileSize = file.size;
    let hexResult = '';

    while(offset < fileSize)
    {
      const chunk = file.slice(offset, offset + CHUNK_SIZE);

      const arrayBuffer = await chunk.arrayBuffer();
      const hexChunk = arrayBufferToHex(arrayBuffer);
      hexResult += hexChunk;
      console.log(hexChunk, "Hello\n");
      offset += CHUNK_SIZE;

      // setProgress(
    }

    setHexData(hexResult);

  }

  // const convertToBase64 = (binaryData) =>
  // {
  //   let binary = '';

  //   const bytes = new Uint8Array(binaryData);
  //   const len = bytes.byteLength;

  //   for(let i = 0; i<len; i++)
  //   {
  //     console.log(i);
  //     binary += String.fromCharCode(bytes[i]);
  //   }

  //   return window.btoa(binary);
  // }

  // const convertToHex = (binaryData) => {
  //   const byteArray = new Uint8Array(binaryData);
  //   const hexArray = Array.from(byteArray, (byte) => {
  //     byte.toString(16).padStart(2, '0')
  //   }).join('');
    
    // return hexArray;
  // }


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

              <button className='button mb-10' onClick={handleFileUpload} >Upload</button>
            </>
            )}
        </div>

      </div>

    </div >
  )
}

export default Home