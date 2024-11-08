const connectToMongo = require("./db");
const express = require('express');
const cors = require("cors");



connectToMongo();

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());        // Use this middleware to parse incoming requests with JSON Payload.

// Available Routes :-
// app.use("/api/chunks/", require("./routes/chunks")

app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
  console.log(`Link :- http://localhost:${PORT}`);
})