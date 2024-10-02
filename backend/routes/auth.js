const authController = require("../controllers/authControllers");
const middlewareController = require("../controllers/middlewareController");

const router = require("express").Router(); //import thuoc tinh Router cua express vao 

//REGISTER
router.post("/register", authController.registerUser); //truy cap vao va thuc hien logic registerUser trong authController.js 
// /register dung de truy cap vao chuc nang dang ki 
module.exports = router;

//LOGIN
router.post("/login", authController.loginUser);

//REFRESH (dam nhan nv refresh lai token)
router.post("/refresh", authController.requestRefreshToken);

//LOG OUT
router.post("/logout", middlewareController.verfyToken, authController.userLogout);

module.exports = router;