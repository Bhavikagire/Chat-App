const express = require("express");
const bcrypt = require("bcrypt");
require('dotenv').config();
const userRouter = express.Router();
const { userModel } = require("../models/user");
const jwt = require("jsonwebtoken")

const { generateVerificationToken, sendVerificationEmail } = require('../controllers/authController');

// Register route
userRouter.post('/register', async (req, res) => {
  try {
    const { Username, email, password } = req.body;

    // Check if the user already exists in the database
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
     
      return res.status(400).json({msg:"User with this email already exists."});
    
    }

    // Generate the verification token
    const verificationToken = generateVerificationToken();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const user = new userModel({ Username, email, password: hashedPassword, verificationToken });

    await user.save();

    // Send the verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({ msg : 'Registration successful. Please check your email for verification.' });
    // alert("Registration successful. Please check your email for verification.")
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' },error);
  }
});

// Verification route
userRouter.get('/verify/:token', async (req, res) => {
    try {
      const verificationToken = req.params.token;
  
      console.log(verificationToken)
      // Find the user in the database based on the verification token
      const user = await userModel.findOne({ verificationToken });
      if (!user) {
        return res.status(400).json({ error: 'Invalid verification token.' });
      }
  
      // Update the user's email verification status in the database
      user.isEmailVerified = true;
      user.verificationToken = null;
      await user.save();
  
      res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
// Login route
userRouter.post("/login",async (req,res)=>{
  const { email, password } = req.body
  try {
    const user = await userModel.find({ email });
    if (user.length > 0) {
      if (!user[0].isEmailVerified) {
        return res.status(400).json({ msg: 'Email not verified. Please verify your email before logging in.' });
      } else {
        bcrypt.compare(password, user[0].password, (err, result) => {
          if (result) {
            let token = jwt.sign({ userID: user[0]._id }, "masai");
            return res.status(200).json({ msg: 'login success', token });
          } else {
            return res.status(400).json({ msg: 'Wrong credentials.' });
          }
        });
      }
    } else {
      return res.status(400).json({ msg: 'User not found.' });
    }
  } catch (error) {
      res.send(error)
  }
})

module.exports = { userRouter };
