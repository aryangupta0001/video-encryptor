const express = require("express");
const router = express.Router();
const { videoMetaData, videoChunk } = require("../models/videoMetaData");
const { body, validationResult } = require("express-validator");


router.post("/uploadvideo", async (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
        try {
            console.log("Hello");
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

            const VideoChunk = await videoChunk.create({
                videoId: videoId, chunkData: chunkData
            });

            const videoData = await videoMetaData.findByIdAndUpdate(videoId, { $addToSet: { videoChunkIds: VideoChunk._id } }, { new: true });


            res.status(201).json({
                message: "Chunk Created",
                id: VideoChunk._id,
                videoId: videoData._id
            })
        }

        catch (error) {
            alert("Alert inside add video chunks chunks.ks", error.message);
            res.status(500).json({ message: "Some Error Occured while adDing video chunks", error: error.message });
        }
    }

    else {
        res.status(400).json({ errors: result.array() });
    }
})

router.get("/totaluploadedchunks", async (req, res) => {
    try {
        const { videoId } = req.query;

        const videoData = await videoMetaData.findById(videoId);

        res.status(201).json({ totalChunk: videoData.videoChunkIds.length })
    }
    catch (error) {
        res.status(500).json({ message: "Some Error Occured while getting total no. of uploaded chunks", error: error.message });
    }
});

module.exports = router;