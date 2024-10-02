const jwt = require("jsonwebtoken");

const middlewareController = {

    //verify token
    verfyToken: (req, res, next) => {
        const token = req.headers.token;
        if(token) {
            //VD: value trong header la Bearer 123456 thi dong lenh duoi la lay duoc 123456
            const accessToken = token.split(" ")[1];
            jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
                if(err){
                    res.status(403).json("Denied!!! Your token is not valid");
                }
                req.user = user;
                next(); //thoa dieu kien o tren thi moi duoc di tiep
            })
        }
        else {
            res.status(401).json("You are not authenticated");
        }
    },

    verifyTokenAndAdminAuth: (req, res, next) => {
        middlewareController.verfyToken(req, res, () => {
            if(req.user.id == req.params.id || req.user.admin) {
                next();
            } else {
                res.status(403).json("You are not allowed to delete other account");
            }
        });
    }
}

module.exports = middlewareController;