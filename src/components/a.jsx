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
    const [videoId, setVideoId] = useState(0);


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
        let totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
        let videoId = '';



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

            // await setVideoId(data.id);
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

            try {
                const addedVideoChunk = await fetch(`http://localhost:3000/api/chunks/addvideochunks/`, {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({ videoId: videoId, chunkData: hexChunk })
                });

                console.log(addedVideoChunk);

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

                <img src={uploadImg} alt="" onClick={() => { document.getElementById("browseFileBtn").click() }} className='cursor' />

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