// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const { authenticate } = require("../middleware/auth");

// Define routes
router.post("/register", authController.register);
// router.post("/register", authController.adminregister);
router.post("/login", authController.login);
router.post("/login1", authController.loginapp);
router.post("/logout", authController.logout);
router.get("/verify/:token", authController.verify);
router.post("/password-forgot", authController.forgotPassword);
router.post("/password-reset", authController.resetPassword);

module.exports = router;
