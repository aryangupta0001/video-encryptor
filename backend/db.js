const mongoose = require('mongoose');
const mongoose_url = "mongodb://127.0.0.1/videoConverter"

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoose_url)
        const dbConnect = mongoose.connection;          // Connection object
        console.log(dbConnect);

        console.log("Connected To Mongo Successfully");
    }
    catch(error){
        console.error("Error Connecting to Database : ", error.message);
    }
}

module.exports = connectToMongo;