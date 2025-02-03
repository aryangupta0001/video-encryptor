import React, { useContext } from 'react'
import { useState } from 'react'
import "./Home.css"
import chunkContext from '../context/chunkContext'
import uploadImg from "../assets/images/cloud-computing.png"

const Home = (props) => {

  const context = useContext(chunkContext);
  const { arrayBufferToHex, insertLockKey, uploadVideo, addVideoChunks, getTotalUploadedChunks, handleLockingKey, convertKeyToHex, lockKey, saveEncryptedFile, deleteBackendData, decryptChunks } = context;


  // Encryption Phase States
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0.0);
  const [videoId, setVideoId] = useState('');


  // Decryption Phase States
  const [vidDetail, setVidDetail] = useState(null);
  const [vidData, setVidData] = useState(null);

  const CHUNK_SIZE = 0.025 * 1024 * 1024;
  const INSERTION_OFFSET = 1000;


  const handleNewFile = (e) => {
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

    console.log("Lock hex : ", lockIdHex);


    const startTime = new Date();
    console.log(`Upload started at ${startTime.toLocaleTimeString()}`)

    console.log(totalChunks + "CHUNKS");


    // Upload Video Details :-
    const videoId = await uploadVideo(fileName, fileSize, totalChunks);
    console.log(videoId);
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

  }

  const handleEncryptedFileDownload = async () => {
    await saveEncryptedFile(videoId);
    await deleteBackendData(videoId);
    await handleFileReset();
  }

  const handleFileReset = async () => {
    setFile(null);
    setUploading(false);
    setUploadPercent(0.0);
    setVideoId('');

  }


  const handleDetailJsonInput = async (e) => {
    setVidDetail(e.target.files[0]);
  }

  const handleDataJsonInput = async (e) => {
    setVidData(e.target.files[0]);
  }

  const readJSON = async (file) => {

    return new Promise((resolve, reject) => {

      if (file.type === 'application/json') {
        const reader = new FileReader();

        let jsonData = '';

        reader.onload = (event) => {
          try {
            jsonData = JSON.parse(event.target.result);
            resolve(jsonData);
          }
          catch (error) {
            console.error('Error parsing JSON:', error);
            reject('Invalid JSON file');
          }
        };

        reader.onerror = (error) => {
          reject("Error reading file");
        };

        reader.readAsText(file);

      } else {
        alert('Please upload a valid JSON file.');
      }

    });
  }

  const handleDecrypt = async () => {

    let detailJSON = '';
    let dataJSON = '';

    try {
      detailJSON = await readJSON(vidDetail);
      detailJSON.fileName = vidData.name;
    }

    catch (error) {
      console.log("Error reading Video Detail JSON File", error);
    }

    try {
      dataJSON = await readJSON(vidData);
    }

    catch (error) {
      console.log("Error reading Video Data JSON File", error);
    }

    try {
      await decryptChunks(detailJSON, dataJSON);
    }

    catch (error) {
      console.error(error);

      alert(error.message);
    }

  }

  return (
    <div className='body' style={{ width: '98.5vw' }}>
      <div id="encrypter" style={{ height: '100vh' }}>

        <center>
          <h1 id='title'>
            Video Encrypter
          </h1>
        </center>

        <div id="dragDrop" className='enc-dec-box mt-10' onDragOver={handleFileDragOver} onDragLeave={handleDragLeave} onDrop={handleFileDrop}>

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
                    <>
                      <button className='button mb-10 cursor' onClick={handleEncryptedFileDownload} >Download Encrypted File</button>
                      <button className='button mb-10 cursor' onClick={handleFileReset}>Upload Another</button>
                    </>
                  }

                </div>
              </>
              )
            }

          </div >
        </div>

      </div>







      <div id="decryptor" style={{ height: '100vh' }}>
        <center>
          <h1 id='title'>
            Video Decrypter
          </h1>
        </center>

        <div className='enc-dec-box mt-10 border-box'>

          <div className="mt-10 border-box mb-10">
            Upload JSON Files
          </div>

          <div style={{ height: "1px" }}>
          </div>

          <div className="mt-10 border-box mb-10">
            Video Details :
            <input type="file" accept='.json' className='json-file-input' id='vid-detail-input' onChange={handleDetailJsonInput} />

            <label htmlFor="vid-detail-input" className='cursor'> {vidDetail ? vidDetail.name : "Click to Select File"}</label>
          </div>


          <div style={{ height: "1px" }}>

          </div>

          <div className="mt-10 border-box mb-10">
            Video Data :
            <input type="file" accept='.json' className='json-file-input' id='vid-data-input' onChange={handleDataJsonInput} />

            <label htmlFor="vid-data-input" className='cursor'> {vidData ? vidData.name : "Click to Select File"}</label>
          </div>

          {
            vidData && vidDetail &&
            <>
              <button className='button mb-10 cursor' onClick={handleDecrypt} >Upload</button>
            </>
          }
        </div>
      </div>

    </div>
  )
}
export default Home