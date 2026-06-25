require("dotenv").config()
const userModel = require("../models/user.model")
const tokenBlacklistModel = require("../models/blacklist.model")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")


/**
 * @name registerUser
 * @route POST /api/auth/register
 * @description Register a new user, expects username, email and password in the request body
 * @access Public
 */
const registerUser = async (req,res) => {
    const { username, email, password } = req.body;

    if(!username || !email || !password){
        return res.status(400).json({
            message : "All fields are required!"}
        )
    }

    const isUserAlreadyExits = await userModel.findOne({
            $or : [ { username }, { email } ]
    })

    if(isUserAlreadyExits) {
        return res.status(400).json({
            message : "Account already exits with this username or email!"
        })
    }

    const hash = await bcryptjs.hash(password,5);

    const newUser = await userModel.create({
        username : username,
        email : email,
        password : hash,
    })

    const token = jwt.sign(
        { id : newUser._id, username : newUser.username},
        process.env.JWT_SECRET,
        { expiresIn : "1d"}
    )

    res.cookie("token", token)

    return res.status(201).json({
        message : "User registered seccessfully!",
        user : {
            id : newUser._id,
            username : newUser.username,
            email : newUser.email
        }
    })  


}
/**
 * @name loginUser
 * @route POST /api/auth/login
 * @description Login a user, expects username and password in the request body
 * @access Public
 */
const loginUser = async (req,res) => {
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({
            message : "All fields are required!"
        })
    }

    const user = await userModel.findOne({email})

    if(!user) {
        return res.status(400).json({
            message : "Invalid email or password!"
        })
    }

    const isPasswordValid = await bcryptjs.compare(password , user.password)

    if(!isPasswordValid) {
        return res.status(400).json({
            message : "Invalid email or password!"
        })
    }

    const token = jwt.sign(
        { id : user._id, username : user.username },
        process.env.JWT_SECRET,
        { expiresIn : "1d" }
    )

    res.cookie("token",token)

    return res.status(200).json({
        message : "User loggedIn successfully!",
        user : {
            id : user._id,
            username : user.username,
            email : user.email
        }
    })


    

}
/**
 * @name logoutUser
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access Public
 */
const logoutUser = async (req,res) => {
    const token = req.cookies.token;

    if(token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token")

    res.status(200).json({
        message : "User logged out successfully!"
    })
}
/**
 * @name getMe
 * @route GET /api/auth/get-me
 * @description Get the details of the logged in user
 * @access Private
 */
const getMe = async (req,res) => {

    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message : "User details fatched successfully!",
        user : {
            id : user._id,
            username : user.username,
            email : user.email
        }
    })
}

module.exports = {registerUser, loginUser, logoutUser, getMe}