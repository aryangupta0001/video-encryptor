import mongoose from "mongoose";
import express from "express";
import videoHex from "./models/hexaCode.js";



const conn = async () => {
    await mongoose.connect("mongodb://localhost:27017/videoConverter")
}
const app = express()
const PORT = 3000;

app.get('/', (req, res) => {
    const videoHex = new videoHex({ title: "sample.mp4", size: "15mb", chunks: [] });

    videoHex.save();

    res.send("Saved");
})



const startServer = async () => {
    await conn();

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`)
    })
}


startServer();