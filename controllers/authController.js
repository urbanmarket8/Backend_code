// controllers/authController.js
const User = require("../models/User");
const Shop = require("../models/Shop");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, CUSTOMER_URL, SHOP_URL, API_URL } = process.env;
const crypto = require("crypto");
const sendEmail = require("../utils/emailConnection");
const generateVerifyToken = () => {
  return crypto.randomBytes(16).toString("hex");
};

// const register = async (req, res) => {
//   try {
//     const {
//       email,
//       password,
//       first_name,
//       last_name,
//       phone_number,
//       is_owner,
//       username,
//       address,
//     } = req.body.data.attributes;

//     // Ensure username is provided
//     if (!username) {
//       return res.status(400).json({ message: "Username is required" });
//     }

//     // Ensure all required fields are provided
//     if (
//       !email ||
//       !password ||
//       !first_name ||
//       !last_name ||
//       !phone_number ||
//       !address
//     ) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const user = new User({
//       email,
//       username,
//       password,
//       first_name,
//       last_name,
//       phone_number,
//       is_owner,
//       address,
//     });

//     console.log(user);

//     try {
//       user.verify_token = generateVerifyToken();

//       await user.save();

//       await sendEmail(email, user.verify_token, API_URL, "verification");

//       return res.status(201).json({
//         message: "success",
//         username: username,
//         email: email,
//         phone_number: phone_number,
//         address: address
//       });
//     } catch (validationError) {
//       console.log(validationError);
//       let message = "Validation error";
//       for (let key in validationError.errors) {
//         message = validationError.errors[key].message;
//       }
//       return res.status(400).json({ message });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const register = async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone_number,
      is_owner,
      username,
    } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (!email || !password || !first_name || !last_name || !phone_number) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = new User({
      email,
      username,
      password,
      first_name,
      last_name,
      phone_number,
      is_owner,
    });

    console.log(user);

    try {
      user.verify_token = generateVerifyToken();
      await user.save();
      await sendEmail(email, user.verify_token, API_URL, "verification");

      return res.status(201).json({
        message: "Sign up successfully",
        username,
        email,
        phone_number,
      });
    } catch (validationError) {
      console.log(validationError);
      let message = "Validation error";
      for (let key in validationError.errors) {
        message = validationError.errors[key].message;
      }
      return res.status(400).json({ message });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const adminregister = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone_number, is_owner } =
      req.body.data.attributes;
    const user = new User({
      email,
      username: email,
      password,
      firstName,
      lastName,
      phone_number,
      is_owner,
    });

    try {
      user.verify_token = generateVerifyToken();
      await user.save();

      await sendEmail(email, user.verify_token, API_URL, "verification");

      return res.status(201).json({ message: "success" });
    } catch (validationError) {
      console.log(validationError);
      let message = "Validation error";
      for (let key in validationError.errors) {
        message = validationError.errors[key].message;
      }
      return res.status(400).json({ message });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body.data.attributes;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        errors: [{ detail: "Please sign up..." }],
      });
    }
    if (!(await user.comparePassword(password))) {
      return res.status(400).json({
        errors: [{ detail: "Invalid password..." }],
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        errors: [{ detail: "Please verify your account..." }],
      });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7h" }
    );

    return res.json({
      token_type: "Bearer",
      expires_in: "7h",
      access_token: token,
      refresh_token: token,
    });
  } catch (error) {
    return res.status(400).json({
      errors: [{ detail: "Internal Server Error" }],
    });
  }

  // try {
  //   const { email, password } = req.body;

  //   const user = await User.findOne({ email });
  //   if (!user) {
  //     return res.status(400).json({
  //       errors: [{ detail: "Please sign up..." }],
  //     });
  //   }
  //   if (!(await user.comparePassword(password))) {
  //     return res.status(400).json({
  //       errors: [{ detail: "Invalid password..." }],
  //     });
  //   }

  //   if (!user.isVerified) {
  //     return res.status(400).json({
  //       errors: [{ detail: "Please verify your account..." }],
  //     });
  //   }

  //   const token = jwt.sign(
  //     { userId: user._id, username: user.username },
  //     JWT_SECRET,
  //     { expiresIn: "7h" }
  //   );

  //   return res.json({
  //     token_type: "Bearer",
  //     expires_in: "7h",
  //     access_token: token,
  //     refresh_token: token,
  //   });
  // } catch (error) {
  //   console.error("Login error:", error);
  //   return res.status(500).json({
  //     errors: [{ detail: "Internal Server Error" }],
  //   });
  // }
};

const loginapp = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        errors: [{ detail: "There are no registered users." }],
      });
    }
    if (!(await user.comparePassword(password))) {
      return res.status(400).json({
        errors: [{ detail: "Passwords do not match." }],
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        errors: [{ detail: "Please verify your account..." }],
      });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7h" }
    );

    return res.json({
      token_type: "Bearer",
      expires_in: "7h",
      access_token: token,
      refresh_token: token,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      errors: [{ detail: "Internal Server Error" }],
    });
  }
};

const logout = async (req, res) => {
  return res.sendStatus(204);
};

const verify = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verify_token: token });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or token is invalid" });
    }

    user.isVerified = true;
    await user.save();
    if (user.is_owner) {
      const newShop = new Shop({
        name: `${user.first_name + " " + user.last_name}'s Shop`,
        owner: user._id,
      });
      await newShop.save();
      //TODO: endpoint gded bt3ml approved 3 l shop
    }

    const redirectUrl = user.is_owner
      ? `${SHOP_URL}/auth/login`
      : `${CUSTOMER_URL}/login`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate reset token and save it to the user
    const token = generateVerifyToken();
    user.verify_token = token;
    await user.save();

    // Send password reset email with the token
    const resetUrl = `${process.env.CUSTOMER_URL}/reset-password/${token}`;
    await sendEmail(email, token, resetUrl, "resetPassword");

    return res
      .status(200)
      .json({ message: "Password reset token sent to email." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  const { password, token, email } = req.body;

  try {
    // Find user by token and email
    const user = await User.findOne({ email, verify_token: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Update user's password and clear the token
    user.password = password;
    user.verify_token = undefined; // Clear the token after successful password reset
    await user.save();

    return res
      .status(200)
      .json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  register,
  login,
  loginapp,
  logout,
  verify,
  forgotPassword,
  resetPassword,
  adminregister,
};
