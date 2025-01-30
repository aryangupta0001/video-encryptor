import React, { useContext } from 'react'
import { useState } from 'react'
import "./Home.css"
import chunkContext from '../context/chunkContext'
import uploadImg from "../assets/images/cloud-computing.png"

const Home = (props) => {

  const context = useContext(chunkContext);
  const { arrayBufferToHex, insertLockKey, uploadVideo, addVideoChunks, getTotalUploadedChunks, handleLockingKey, convertKeyToHex, lockKey, saveEncryptedFile } = context;

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0.0);
  const [videoId, setVideoId] = useState('');



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
    let totalChunks = Math.ceil(fileSize / CHUNK_SIZE);



    // Convert Lock Key into Hexadecimal Format :-
    const lockIdHex = await convertKeyToHex();

    console.log("HeX : " + lockIdHex);

    const startTime = new Date();
    console.log(`Upload started at ${startTime.toLocaleTimeString()}`)

    console.log(totalChunks + "CHUNKS");


    // Upload Video Details :-
    const videoId = await uploadVideo(fileName, fileSize, totalChunks);
    setVideoId(videoId);


    while (offset < fileSize) {
      const chunk = file.slice(offset, (offset + CHUNK_SIZE > fileSize) ? fileSize : offset + CHUNK_SIZE);

      const arrayBuffer = await chunk.arrayBuffer();
      const hexChunk = arrayBufferToHex(arrayBuffer);



      const saltedHexChunk = await insertLockKey(hexChunk, lockIdHex, INSERTION_OFFSET);


      // Upload Video Chunks :-
      await addVideoChunks(videoId, saltedHexChunk);

      offset += CHUNK_SIZE;

      if (offset > fileSize)
        offset = fileSize;

      setUploadPercent(offset * 100 / fileSize);
    }



    const totalUploadedChunks = await getTotalUploadedChunks(videoId);
    console.log(totalChunks == totalUploadedChunks ? "All chunks uploaded successfully" : `${totalChunks - totalUploadedChunks} chunks are missing`);

    const endTime = new Date();
    console.log(`Upload started at ${endTime.toLocaleTimeString()}`)
    console.log(`Time Taken : ${(endTime - startTime) / 1000}`);

    // setUploading(false);

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

              <input type="text" id='lockKeyInput' className='mb-10' placeholder='Enter Alpha-Numeric Locking Key (Max. 20 characters)' onChange={handleLockingKey} disabled={uploading ? true : false} />
              {!uploading &&
                <>
                  <button className='button mb-10 cursor' onClick={handleFileUpload} style={{ display: lockKey.length > 0 ? "block" : "none" }} >Upload</button>
                </>
              }

              <div style={{ display: uploading ? "block" : "none" }} className='m-auto w-70'>
                <div id="progressBarDiv">
                  <div id="progressBar" style={{ width: `${uploadPercent}%` }}>
                  </div>
                </div>

                <div style={{ display: (uploadPercent < 100) ? "block" : "none" }}> Uploading... {uploadPercent.toFixed(2)}% </div>

                <div style={{ display: (uploadPercent < 100) ? "none" : "block" }}>Upload Complete</div>

                {uploadPercent == 100 &&
                  <button className='button mb-10 cursor' onClick={() => { console.log("VID : ", videoId); saveEncryptedFile(videoId) }} >Download Encrypted File</button>
                }

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