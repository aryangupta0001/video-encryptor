const mongoose = require("mongoose");

const videoChunkSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'video'
    },

    chunkData: {
        type: String,
        required: true
    }
})

const videoMetaDataSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    size: {
        type: String,
        required: true
    },

    totalChunks: {
        type: Number,
        required: true
    },

    videoChunkIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VideoChunk'
    }]
})

const videoMetaData = mongoose.model("video", videoMetaDataSchema);
const videoChunk = mongoose.model("chunks", videoChunkSchema);

module.exports = {
    videoMetaData,
    videoChunk
};