const middlewareController = require("../controllers/middlewareController");
const userController = require("../controllers/userController");

const router= require("express").Router();

//Get all users
router.get("/", middlewareController.verfyToken, userController.getAllUsers); //middleware la buoc o giua xac nhan xem ng dang nhap da co tai khoan hay chua

module.exports = router;

//Delete user
router.delete("/:id", middlewareController.verifyTokenAndAdminAuth, userController.deleteUser);

module.exports = router;
