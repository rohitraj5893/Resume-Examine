const express = require("express")
const authRouter = express.Router()
const authController = require("../controllers/auth.controller")
const autMiddleware = require("../middlewares/auth.middleware")

/**
 * @route POST /api/auth/register
 * @description Register a new user, expects username, email and password in the request body
 * @access Public
 */
authRouter.post("/register",authController.registerUser)
/**
 * @route POST /api/auth/login
 * @description Login a user, expects email and password 
 * @access Public
 */
authRouter.post("/login",authController.loginUser)
/**
 * @route GET /api/auth/logout
 * @description clears the token from the cookie and adds the token to the blacklist
 * @access Public
 */
authRouter.get("/logout",authController.logoutUser)
/**
 * @rounte GET /api/auth/get-me
 * @description Get the details of the logged in user
 * @middleware middleware is used to verify the token and get the user details
 * @access Private
 */
authRouter.get("/get-me", autMiddleware.authUser, authController.getMe)




module.exports = authRouter