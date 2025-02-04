import chunkContext from './chunkContext'
import { useState } from 'react'
import LZString from 'lz-string';



const ChunkState = (props) => {

    // Lock Key processing Code :-

    const [lockKey, setLockKey] = useState('');

    const handleLockingKey = async () => {
        const keyInput = document.getElementById('lockKeyInput');

        const key = keyInput.value.slice(0, 20).replaceAll(" ", "");

        keyInput.value = key;

        console.log("Original Lock Key : ", key);
        setLockKey(key);
    }

    const convertKeyToHex = async () => {
        return Array.from(lockKey) // Convert string to array of characters
            .map(char => char.charCodeAt(0).toString(16).padStart(2, '0')) // Convert each char to hex
            .join(''); // Join the hex valu es into a single String
    }


    // Video file to Hexadecimal conversion :-

    const arrayBufferToHex = (buffer) => {
        const byteArray = new Uint8Array(buffer);

        return byteArray.reduce((hexString, byte) => {
            return hexString + ('0' + byte.toString(16)).slice(-2);
        }, '');
    };


    // Hexadecimal to Array Buffer conversion :-

    const hexToArrayBuffer = (hexString) => {
        if (hexString.length % 2 !== 0) {
            // hexString = '0' + hexString;
            throw new Error('Video data is Tampered');
        }

        const byteArray = new Uint8Array(hexString.length / 2);

        for (let i = 0; i < hexString.length; i += 2) {
            byteArray[i / 2] = parseInt(hexString.substr(i, 2), 16);
        }

        return byteArray.buffer;
    };



    // Salting Hex Chunk :-

    const insertLockKey = async (hexChunk, lockKey, INSERTION_OFFSET) => {

        let a = [];
        let pos = 0;

        while (true) {
            if (pos + INSERTION_OFFSET <= hexChunk.length) {
                a.push(lockKey.concat(hexChunk.slice(pos, pos + INSERTION_OFFSET)));
                pos = pos + INSERTION_OFFSET;
            }

            else {
                a.push(lockKey.concat(hexChunk.slice(pos, hexChunk.length)));
                setLockKey(lockKey);
                break;
            }
        }

        return a.join('');
    }


    // Upload Video Details :-

    const uploadVideo = async (fileName, fileSize, totalChunks) => {
        try {
            console.log(JSON.stringify({ fileName, fileSize, totalChunks }));
            const response = await fetch("http://localhost:3000/api/chunks/uploadvideo", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({ fileName, fileSize, totalChunks })
            });


            const data = await response.json();
            let videoId = data.id;
            return videoId

        }

        catch (error) {
            console.log("Hey here is an error", error);
            alert("Some error Occured in uploading video details\nCheck console");
        }
    }


    // Function to compress chunks
    async function compressChunk(encryptedChunk) {
        try {
            const compressedChunk = LZString.compressToBase64(encryptedChunk); // Compress and encode to Base64
            return compressedChunk;
        }
        catch (err) {
            console.error("Error while compressing chunk", err);
        }
    }


    // Upload Video Chuunks :-

    const addVideoChunks = async (videoId, saltedHexChunk) => {

        const compressedChunk = await compressChunk(saltedHexChunk);

        console.log("Compressed chunk : ", compressedChunk);

        try {
            const addedVideoChunk = await fetch(`http://localhost:3000/api/chunks/addvideochunks`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },


                body: JSON.stringify({ videoId: videoId, chunkData: compressedChunk })
            });

            const chunkData = await addedVideoChunk.json();


            console.log("Encrypted chunk : \t", chunkData.videoChunk);

        }

        catch (error) {
            alert("Some error Occured in uploading video chunks\nCheck console\n" + error.message);
            console.log(error);
        }
    }

    const getTotalUploadedChunks = async (videoId) => {
        try {
            const toalUploadedChunks = await fetch(`http://localhost:3000/api/chunks/uploadedvideodetail?videoId=${videoId}&reqd=chunkcount`, {
                method: "GET",

                headers: {
                    "Content-Type": "application/json",
                },
            });

            const uploadedChunkCount = await toalUploadedChunks.json();
            return uploadedChunkCount.totalChunk;
        }

        catch (error) {
            alert("Some error Occured in counting the total no. of uploaded chunks\nCheck console");
            console.log(error);
        }
    }

    const saveEncryptedFile = async (videoId) => {
        try {
            const detailResponse = await fetch(`http://localhost:3000/api/chunks/uploadedvideodetail?videoId=${videoId}&reqd=all`, {
                method: "GET",

                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!detailResponse.ok) {
                throw new Error("Detail Response NOT OK");
            }

            let videoDetails = await detailResponse.json();

            videoDetails.lockKey = lockKey;

            const videoDetailsBlob = new Blob([JSON.stringify(videoDetails)], { type: 'application/json' });


            let videoDetailURL = window.URL.createObjectURL(videoDetailsBlob);
            const a = document.createElement('a');
            a.href = videoDetailURL;
            a.download = 'video_details.json';
            document.body.appendChild(a);



            const chunkResponse = await fetch(`http://localhost:3000/api/chunks/getencryptedchunks?videoId=${videoId}`);

            if (!chunkResponse.ok)
                throw new Error("Chunk Response NOT OK");

            const videoData = await chunkResponse.json();
            const videoBlob = new Blob([JSON.stringify(videoData)], { type: 'application/json' });

            // const blob = await response.blob();
            let videoURL = window.URL.createObjectURL(videoBlob);
            const b = document.createElement('a'); // Create an anchor element
            b.href = videoURL;
            b.download = `${videoDetails.title}.json`; // Name of the downloaded file
            document.body.appendChild(b);


            b.click();
            document.body.removeChild(a); // Cleanup
            a.click();
            document.body.removeChild(b);

        }

        catch (error) {
            console.error('Error downloading file:', error);
            console.error('Error downloading file:', response.statusText);
        }

    }


    const deleteBackendData = async (videoId) => {
        try {
            const deleteData = await fetch(`http://localhost:3000/api/chunks/deleteData?videoId=${videoId}`, {
                method: "DELETE",

                headers: {
                    "Content-Type": "application/json",
                },
            });


            const deleteResponse = await deleteData.json();
            console.log(deleteResponse);

        }
        catch (error) {
            console.log(error);
        }
    }


    const decryptChunks = async (videoDetails, videoData) => {
        const chunks = videoDetails.totalChunks;
        const chunkKeys = Object.keys(videoData);

        let videoHex = []


        if (chunkKeys.length != chunks) {
            console.log(chunkKeys.length, chunks);

            throw new Error("Video files are tampered");
        }

        else {
            const response = await fetch(`http://localhost:3000/api/chunks/postdecryptionkeys`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },


                body: JSON.stringify({ secretKey: videoDetails.secretKey, iv: videoDetails.iv, lockKey: videoDetails.lockKey })
            });

            const resJson = await response.json();


            if (resJson.decryptKeysSet === "Success") {
                for (const chunkNum of chunkKeys) {
                    const response = await fetch(`http://localhost:3000/api/chunks/decryptvideochunks`, {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },


                        body: JSON.stringify({ chunkData: videoData[chunkNum] })
                    });

                    const decryptResponse = await response.json();

                    if (decryptResponse.result == "Success") {
                        videoHex.push(decryptResponse.chunk);
                    }

                    else {
                        console.error("Lock Key verification Failed", decryptResponse.result, videoDetails.lockKey);
                        return;
                    }
                }

                let fileBuffer = [];

                for (const chunk of videoHex) {
                    const arrayBuffer = hexToArrayBuffer(chunk);
                    fileBuffer.push(new Uint8Array(arrayBuffer));
                }

                // Combine all ArrayBuffers into one
                const combinedBuffer = new Uint8Array(fileBuffer.reduce((acc, curr) => acc.concat(Array.from(curr)), []));

                let fileName = videoDetails.fileName;
                // let fileName = 'video.mp4';
                const fileNameSplit = fileName.split(".");

                fileName = fileNameSplit[0] + "." + fileNameSplit[1];

                const fileType = fileNameSplit[1];
                console.log(fileType);


                // Save the combined ArrayBuffer as a video file
                const blob = new Blob([combinedBuffer], { type: `video/${fileType}` });  // Assuming it's an MP4 file, adjust as needed
                const file = new File([blob], fileName);



                // You can now download or process the reconstructed file as needed
                // For example, to trigger a download in the browser:

                const url = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);


            }
        }


    }

    return (
        <chunkContext.Provider value={{ arrayBufferToHex, insertLockKey, uploadVideo, addVideoChunks, getTotalUploadedChunks, handleLockingKey, convertKeyToHex, saveEncryptedFile, decryptChunks, deleteBackendData, lockKey }}>
            {props.children}
        </chunkContext.Provider>
    )
}

export default ChunkState;