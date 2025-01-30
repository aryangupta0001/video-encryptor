const express = require("express");
const router = express.Router();
const { videoMetaData, videoChunk } = require("../models/videoMetaData");
const { body, validationResult } = require("express-validator");

const crypto = require('crypto');

// Function to generate a random 256-bit (32-byte) secret key
const secretKey = crypto.randomBytes(32); // 32 bytes = 256 bits

// Function to generate a random 128-bit (16-byte) IV
const iv = crypto.randomBytes(16); // 16 bytes = 128 bits



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
            console.log("Inside try block of addvideochunks router");

            const { videoId, chunkData } = req.body;


            const chunkBuffer = Buffer.from(chunkData, 'hex');

            const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

            let encryptedChunk = cipher.update(chunkBuffer);
            encryptedChunk = Buffer.concat([encryptedChunk, cipher.final()]);
            encryptedChunk = encryptedChunk.toString('hex');

            

            const VideoChunk = await videoChunk.create({
                videoId: videoId, chunkData: encryptedChunk
            });

            const videoData = await videoMetaData.findByIdAndUpdate(videoId, { $addToSet: { videoChunkIds: VideoChunk._id } }, { new: true });


            res.status(201).json({
                message: "Chunk Created",
                id: VideoChunk._id,
                videoId: videoData._id
            })
        }

        catch (error) {
            console.log("Alert inside add video chunks", error)
            res.status(500).json({ message: "Some Error Occured while adDing video chunks", error: error.message });
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

        // const videoTitle = await videoMetaData.findOne({ _id: videoId }).title;
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


// router.get("/getvideodetails", async(req, res) => {
//     try{

//     }
// })

module.exports = router;