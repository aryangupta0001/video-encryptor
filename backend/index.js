const connectToMongo = require("./db");
const express = require('express');
const cors = require("cors");


connectToMongo();

const PORT = 3000;
const app = express();

// app.use(cors());

app.use(cors({
  origin: 'http://localhost:5173',  // Allow requests from frontend on port 3001
  methods: ['GET', 'POST', 'OPTIONS'],  // Allow only specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization']  // Allow specific headers
}));



app.use(express.json());        // Use this middleware to parse incoming requests with JSON Payload.

// Available Routes :-
app.use("/api/chunks/", require("./routes/chunks"));

app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
  console.log(`Link :- http://localhost:${PORT}`);
})