const express = require("express");
const router = express.Router();
const { videoMetaData, videoChunk } = require("../models/videoMetaData");
const { validationResult } = require("express-validator");
const LZString = require('lz-string');  // Using require for lz-string module

const crypto = require('crypto');
const { default: mongoose } = require("mongoose");

const OFFSET = 1000;


// Function to generate a random 256-bit (32-byte) secret key
const secretKey = crypto.randomBytes(32); // 32 bytes = 256 bits

// Function to generate a random 128-bit (16-byte) IV
const iv = crypto.randomBytes(16); // 16 bytes = 128 bits

let decryptIV = '';
let decryptSecretKey = '';
let decryptLockKey = '';





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



// Function to decompress the chunks

async function decompressChunk(compressedChunk) {
    try {
        const decompressed = LZString.decompressFromBase64(compressedChunk); // Decode and decompress
        return decompressed;


    } catch (error) {
        console.error("Error while decompressing chunk", err);
    }
}


router.post("/uploadvideo", async (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
        try {
            const { fileName, fileSize, totalChunks } = req.body;

            const VideoDetails = await videoMetaData.create({
                title: fileName, size: fileSize, totalChunks: totalChunks
            });
            res.status(201).json({ message: "VideoHex created", id: VideoDetails._id })
        }

        catch (error) {
            alert("Error caught in chunk.js : /uploadvideo" + error.message);
            // res.status(500).json({ message: "Some Error Occured while updating video details", error: error.message });
        }
    }

    else {
        res.status(400).json({ errors: result.array() });
    }
})


router.post("/addvideochunks/", async (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
        try {
            console.log("Inside try block of uploadedvideodetail router");

            const { videoId, chunkData } = req.body;


            const chunkBuffer = Buffer.from(chunkData, 'hex');

            const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

            let encryptedChunk = cipher.update(chunkBuffer);
            encryptedChunk = Buffer.concat([encryptedChunk, cipher.final()]);
            encryptedChunk = encryptedChunk.toString('hex');

            console.log("Encrypted chunk : ", encryptedChunk);

            const compressedChunk = await compressChunk(encryptedChunk);


            const VideoChunk = await videoChunk.create({
                videoId: videoId, chunkData: compressedChunk
                // videoId: videoId, chunkData: encryptedChunk
            });

            const videoData = await videoMetaData.findByIdAndUpdate(videoId, { $addToSet: { videoChunkIds: VideoChunk._id } }, { new: true });


            res.status(201).json({
                message: "Chunk Created",
                id: VideoChunk._id,
                videoId: videoData._id,
                videoChunk: VideoChunk.chunkData
            })
        }

        catch (error) {
            console.log("Alert inside add video chunks", error)
            res.status(500).json({ message: "Some Error Occured while adding video chunks", error: error.message });
        }
    }

    else {
        res.status(400).json({ errors: result.array() });
    }
})

router.get("/uploadedvideodetail", async (req, res) => {
    try {
        const { videoId, reqd } = req.query;

        const videoData = await videoMetaData.findById(videoId);

        if (reqd === "chunkcount") {
            res.status(201).json({ totalChunk: videoData.videoChunkIds.length })
        }

        else if (reqd === "all") {
            res.status(201).json({ title: videoData.title, size: videoData.size, totalChunks: videoData.totalChunks, secretKey: secretKey, iv: iv });
        }

    }
    catch (error) {
        res.status(500).json({ message: "Some Error Occured while getting total no. of uploaded chunks", error: error.message });
    }
});

router.get("/getencryptedchunks", async (req, res) => {
    try {
        const { videoId } = req.query;
        let numberedChunkData = {};

        const videoDetail = await videoMetaData.findById(videoId);

        if (videoDetail) {
            const vName = videoDetail.title;
            console.log("video name : ", vName);

            const projection = { chunkData: 1 };
            const vidChunks = await videoChunk.find({ videoId: videoId }, projection);

            let counter = 1;

            vidChunks.forEach((doc) => {
                numberedChunkData[counter] = doc.chunkData; // Add chunkData with numbered keys
                counter++;
            });
            res.setHeader('Content-Disposition', `attachment; filename=${vName}.json`); // File download header
            res.setHeader('Content-Type', 'application/json');

            res.json(numberedChunkData);
        }
        else {
            console.log("Video not found");
        }
    }

    catch (error) {
        console.log("Error inside getencrypted chunks, chunks.js", error.message)
        res.status(500).json({ message: "Some Error Occured while downloading json file", error: error.message });

    }
})


router.delete("/deleteData", async (req, res) => {
    try {
        const { videoId } = req.query;

        let doc = await videoMetaData.findByIdAndDelete(videoId);

        if (mongoose.Types.ObjectId.isValid(videoId)) {
            console.log("Converting the video id to object id");

            try {
                id = new mongoose.Types.ObjectId(videoId);
            }
            catch (error) {
                console.log(error);
            }
        }
        else
            return res.status(400).json({ error: "Invalid videoId" });

        await videoChunk.deleteMany({ videoId: id });

        doc = await videoMetaData.findById(videoId);

        if (doc == null) {
            doc = await videoChunk.findOne({ videoId: id });

            if (doc == null)
                res.json({ deleted: "OK" });

            else
                res.json({ deleted: "NotOK" });
        }

        else
            res.json({ deleted: "NotOK" });
    }

    catch (error) {
        res.send(error);
    }
})


router.post("/postdecryptionkeys", async (req, res) => {
    try {
        const { secretKey, iv, lockKey } = req.body;

        decryptSecretKey = Buffer.from(secretKey.data);
        decryptIV = Buffer.from(iv.data);
        decryptLockKey = lockKey;

        res.json({ "decryptKeysSet": "Success" });

    }
    catch (error) {
        res.json({ "decryptKeysSet": "Fail", "error": `${error.message}` });
    }
});

router.post("/decryptvideochunks", async (req, res) => {
    // const result = validationResult(req);


    // if (result.isEmpty()) {
    const { chunkData } = req.body;

    // decompress to convert the data to the encrypted format :-
    const encryptedChunk = await decompressChunk(chunkData);




    // decryption process :-
    const encryptedBuffer = Buffer.from(encryptedChunk, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', decryptSecretKey, decryptIV);

    let decryptedChunk = decipher.update(encryptedBuffer);
    decryptedChunk = Buffer.concat([decryptedChunk, decipher.final()]);


    if (decryptedChunk) {

        console.log(decryptedChunk);

        // Convert decrypted buffer to Hex :-
        const base64DecodedData = decryptedChunk.toString('hex');  // Assuming the decrypted data is a Base64 string

        if (base64DecodedData) {

            // decompress again to convert the decrypted data to the salted hexadecimal format :-
            // const chunk = LZString.decompressFromBase64(base64DecodedData);

            const chunk = base64DecodedData;


            if (chunk) {
                let pos = 0;
                const lockLength = decryptLockKey.length;
                let a = []

                while (true) {

                    const end = pos + lockLength + OFFSET <= chunk.length ? pos + lockLength + OFFSET : chunk.length;
                    const last = end < chunk.length ? 0 : 1;

                    if (chunk.slice(pos, pos + lockLength) == decryptLockKey) {
                        a.push(chunk.slice(pos + lockLength, end));
                        pos = end;
                    }

                    else {
                        console.log(chunk.slice(pos, pos + lockLength), decryptLockKey);

                        res.json({ "result": "Lock Key Verification Failed" });
                        return;
                    }

                    if (last) {
                        break;
                    }

                }

                const checkedChunk = a.join('');
                // */

                res.json({ "result": "Success", "chunk": checkedChunk });
            }
            else {
                res.json({ "result": "Something went wrong 1", "chunk": "checkedChunk" })
            }
        }
        else {
            res.json({ "result": "Something went wrong 2", "chunk": "checkedChunk" })
        }
    }
    else {
        res.json({ "result": "Something went wrong 3", "chunk": "checkedChunk" })
    }
    // }


})


module.exports = router;