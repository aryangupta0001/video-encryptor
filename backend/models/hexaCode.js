const mongoose = require("mongoose");

const videoChunkSchema = new mongoose.Schema({
    chunk: {
        type: String,
        required: true
    }
})

const videoHexSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    size: {
        type: String,
        default: null,
        required: true
    },

    chunks: {
        type: [videoChunkSchema],
        required: true
    }
})


module.exports = mongoose.model("videoHex", videoHexSchema);