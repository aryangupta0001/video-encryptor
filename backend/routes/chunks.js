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
                title : fileName, size : fileSize, chunks: []
            });
            res.status(201).json({ message: "VideoHex created"})
        }

        catch (error) {
            // res.status(500).send("Some Error Occured");
            console.log("Some error occured");
            console.log(error);
        }
    }

    else {
        res.send({ errors: result.array() });
    }
})


router.post("/addchunks", async(req, res) => {
    const result = validationResult(req);
})


module.exports = router;