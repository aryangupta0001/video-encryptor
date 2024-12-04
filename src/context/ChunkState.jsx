import chunkContext from './chunkContext'
import { useState } from 'react'


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
            .join(''); // Join the hex values into a single String
    }


    // Video file to Hexadecimal conversion :-

    const arrayBufferToHex = (buffer) => {
        const byteArray = new Uint8Array(buffer);

        return byteArray.reduce((hexString, byte) => {
            return hexString + ('0' + byte.toString(16)).slice(-2);
        }, '');
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


    // Upload Video Chuunks :-

    const addVideoChunks = async (videoId, saltedHexChunk) => {
        try {
            const addedVideoChunk = await fetch(`http://localhost:3000/api/chunks/addvideochunks`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },


                body: JSON.stringify({ videoId: videoId, chunkData: saltedHexChunk })
            });

            const chunkData = await addedVideoChunk.json();


            console.log("Video Chunk : \t", chunkData.id);

        }

        catch (error) {
            alert("Some error Occured in uploading video chunks\nCheck console\n" + error.message);
            console.log(error);
        }
    }

    const getTotalUploadedChunks = async (videoId) => {
        try {
            const toalUploadedChunks = await fetch(`http://localhost:3000/api/chunks/totaluploadedchunks?videoId=${videoId}`, {
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
            console.log(videoId);
            const response = await fetch(`http://localhost:3000/api/chunks/getencryptedchunks?videoId=${videoId}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); // Create an anchor element
            a.href = url;
            a.download = 'video.json'; // Name of the downloaded file
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a); // Cleanup
        }

        catch (error) {
            console.error('Error downloading file:', error);
        }

    }

    return (
        <chunkContext.Provider value={{ arrayBufferToHex, insertLockKey, uploadVideo, addVideoChunks, getTotalUploadedChunks, handleLockingKey, convertKeyToHex, saveEncryptedFile, lockKey }}>
            {props.children}
        </chunkContext.Provider>
    )
}

export default ChunkState;