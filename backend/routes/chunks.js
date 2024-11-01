const express = require("express");
const router = express.Router();
const hexaCode = require("../models/hexaCode");
const { body, validationResult } = require("express-validator");


router.post("/createvideohex", async (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
        try {
            console.log(body);
            const { fileName, fileSize } = req.body;

            const videohex = await hexaCode.create({
                title: fileName, size: fileSize, chunks: []
            });
            res.status(201).json({ message: "VideoHex created", id: videohex._id })
        }

        catch (error) {
            res.status(500).json({ message: "Some Error Occured", error: error.message });
        }
    }

    else {
        res.status(400).json({ errors: result.array() });
    }
})


router.put("/addvideochunks:/id", async (req, res) => {
    const { id } = req.params;
    const { chunkData } = req.body;

    try{
        const videoHex = await hexaCode.findById(id);

        if(videoHex)
        {
            videoHex.chunks.push({chunk: chunkData});

            await videoHex.save();
        }
    }

    catch(error)
    {
        console.log("Error generated at line no. 49 in chunks.js");
    }
})


module.exports = router;