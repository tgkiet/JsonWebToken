const User = require("../models/User");

const userController = {
    //Get all users
    getAllUsers: async(req, res) => {
        try {
            const user = await User.find();
            res.status(200).json(user);
        } catch(err) {
            res.status(500).json(err);
        }
    },
    //Delete User
    deleteUser: async(req, res) => {
        try{
            const user = await User.findByIdAndDelete(req.params.id); //params de cho url ap dung cho moi so
            res.status(200).json("Delete this user successfully");
        } catch {
            res.status(500).json(err);
        }
    }
}

module.exports = userController;