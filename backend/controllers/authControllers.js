const User = require("../models/User"); //truy cap vao file User.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); //bcrypt giup hash password khi luu vao database

let refreshTokens = [];
const authController = {
    //REGISTER
    registerUser: async(req, res) => {
        try{
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt); 

           //Create new user trong database
           const newUser = await new User({
                username: req.body.username,
                email: req.body.email,
                password: hashed,

           });

           //Save to database
           const user = await newUser.save();
           console.log(user);
           res.status(201).json({ message: "Tạo tài khoản thành công", data: user }); // gửi phản hồi với status 201 (Created)
        }catch(err) {
            res.status(500).json({ message: "Lỗi tạo tài khoản", error: err }); // gửi phản hồi với status 500 (Internal Server Error)
        }
    },

    //GENERATE ACCESS TOKEN
    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                admin: user.admin
            },
            process.env.JWT_ACCESS_KEY, //tai sao lai  bi string|undefined??
            {expiresIn: "30s"} //tgian JWT het han, de nguoi dung dang nhap lai
          );
    },

    //GENERATE REFRESH TOKEN
    generateRefreshToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                admin: user.admin
            },
            process.env.JWT_REFRESH_KEY, //tai sao lai  bi string|undefined??
            {expiresIn: "100d"} //tgian JWT backup het han, de nguoi dung dang nhap lai
          );
    },

    //LOGIN
    loginUser: async(req, res) => {
        try {
            const user = await User.findOne({username: req.body.username});
            if(!user) {
                res.status(404).json("Your username was wrong, check again bro"); 
            }
            const validPassword = await bcrypt.compare(
                req.body.password,
                user.password
            );
            if(!validPassword) {
                res.status(404).json("Your password was wrong, check again bro");
            }
            if(user && validPassword) {
                const accessToken = authController.generateAccessToken(user);    
                const refreshToken = authController.generateRefreshToken(user);
                refreshTokens.push(refreshToken);
                //cach gan cookie vao cho refreshToken
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: "/",
                    sameSite: "strict",
                })
                const {password, ...others} = user._doc;
                res.status(200).json({...others, accessToken}); //refreshToken da luu vao cookie nen ko can tra ve
            }

        } catch (err) {
            res.status(500).json(err);
        }
    },

    //REFRESH TOKEN => uu tien su dung REDIS, luu refresh token nay vao database cua REDIS, project nay chi dung array o tren dau file de thay the 
    requestRefreshToken: async(req, res) => {
        //take refreshToken from user
        const refreshToken = req.cookies.refreshToken;  //o tren la cookie, nhung o day lai la cookies, 
                                                        //vi dang truy cap vao cookies cua thunderclient va lay thuoc tinh co ten la refreshToken ra
        if(!refreshToken) return res.status(401).json("You are not authenicated");
        if(!refreshTokens.includes(refreshToken)) {
            return res.status(403).json("This Refresh Token is not valid");
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
            if(err){
                console.log(err);
            }
            refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
            //create new accessToken then refresh Token
            const newAccessToken = authController.generateAccessToken(user);
            const newRefreshToken = authController.generateRefreshToken(user);
            refreshTokens.push(newRefreshToken);
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });
            res.status(200).json({accessToken: newAccessToken});
        })
    },

    //LOG OUT 
    userLogout: async(req, res) => {
        res.clearCookie("refreshToken");
        refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
        res.status(200).json("Logged out !!!");
    }
};

module.exports = authController;

//STORE TOKEN
//Cach 1: Local Storage
//de bi tan cong theo phuong thuc XSS
//Cach 2: HTTPONLY COOKIES
//van se bi tan cong bang XSS nhung kho hon. Nhung se de bi tan cong boi CSRF nhung co the khac phuc bang cach SAMESITE

//Cach 3: REDUX STORE -> luu tru ACCESSTOKEN. HTTPONLY COOKIES -> luu tru REFRESHTOKEN (project nay su dung cach nay)

//Cach han che toi thieu hacker lay token: BFF PATTERN (BACKEND FOR FRONTEND)


////cách 2 cua cach luu du lieu vao database

// const express = require('express');
// const bcrypt = require('bcrypt');
// const User = require('../models/User');

// const authController = {
//   //REGISTER
//   registerUser: async (req, res) => {
//     console.error("Hàm registerUser được gọi");
//     try {
//       console.log("Request body:", req.body);
//       console.log("Request headers:", req.headers);

//       const salt = await bcrypt.genSalt(10);
//       console.log("Salt generated:", salt);

//       const hashed = await bcrypt.hash(req.body.password, salt);
//       console.log("Password hashed:", hashed);

//       const newUser = new User({
//         username: req.body.username,
//         email: req.body.email,
//         password: hashed,
//       });

//       console.log("New user created:", newUser);

//       try {
//         await newUser.save(); // Wait for the save operation to complete
//         console.log("User saved successfully!");
//         res.status(201).send({ message: "Tạo tài khoản thành công", data: newUser });
//       } catch (saveErr) {
//         console.log("Error saving user:", saveErr);
//         console.log("Error stack:", saveErr.stack);
//         console.log("Error message:", saveErr.message);
//         res.status(500).send({ message: "Lỗi tạo tài khoản", error: saveErr });
//         return;
//       }
//     } catch (err) {
//       console.log("Error registering user:", err);
//       console.log("Error stack:", err.stack);
//       console.log("Error message:", err.message);
//       res.status(500).send({ message: "Lỗi tạo tài khoản", error: err });
//     }
//   },
// };

// module.exports = authController;


