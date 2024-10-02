const express = require("express")
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");

const app = express();

dotenv.config();

//truy cập từ trong 1 file sẽ không bảo mật = truy cập qua .env
// const uri = 'mongodb+srv://gkinhere:kiet14102005@gkinhere.5ldcz.mongodb.net/?retryWrites=true&w=majority&appName=gkinhere'; 

const connectToMongodb = async() => {
    try {
        // await mongoose.connect(uri);
        await mongoose.connect(process.env.uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(error.message);
    }
}
connectToMongodb();

app.use(cors()); //ngan chan loi cua cors
app.use(cookieParser()); //tao va gan cookie
app.use(express.json());

//ROUTES
app.use("/v1/auth", authRoute); //truy cap
app.use("/v1/user", userRoute);


const startServer = async() => {
  try {
      const server = await app.listen(8000, () => {
      console.log("Server is running")
    });
  } catch (error) {
    console.error("Error starting server:", error.message);
    process.exit(1);
  }
}
startServer();

//AUTHENICATION (xác thực)

//AUTHORIZATION (phân quyền)
//JSON WEB TOKEN