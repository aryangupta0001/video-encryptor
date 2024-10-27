import mongoose from "mongoose";

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
        default: null
    },

    chunks: {
        type: [videoChunkSchema],
        required: true
    }
})


const videoHex = mongoose.model("videoHex", videoHexSchema);

export default videoHex;