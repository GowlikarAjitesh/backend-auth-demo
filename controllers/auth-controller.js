const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecretKey = process.env.JWT_SECRET_KEY;
//register controller
const registerUser = async (req, res) => {
  try {
    // console.log(req.body);
    const { username, email, password, role } = req.body;
    const user = await User.findOne({$or: [{ username }, { email }]});
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already Exists",
      });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create a new user and save in your database
    const newlyCreatedUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
      role: role || "user",
    });

    if (newlyCreatedUser) {
      res.status(201).json({
        success: true,
        message: "new user registered successfully",
        data: newlyCreatedUser,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "unable to register user",
      });
    }
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

//login controller
const loginUser = async (req, res) => {
  try {
    const { credential, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({
      $or: [{ username: credential }, { email: credential }],
    });
    console.log(user);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user doesn't exists",
      });
    }

    //if the password is correct or not
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    //if password doesnot match
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "password doesnot match",
      });
    }

    //create a token (bearer token), this token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      jwtSecretKey,
      { expiresIn: "30m" },
    );

    res.status(200).json({
      success: true,
      message: "Login Successfull",
      accessToken: token,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

//reset password controller
const changePassword = async (req, res) => {
  try {
    //get user id
    const userId = req.userInfo.userId;
    //get old and new password
    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(userId);
      console.log("This is user: ", user);
    if(!user){
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if(oldPassword === newPassword){
      return res.status(400).json({
        success: false,
        message: 'New password and Old password must be different'
      });
    }
    //verify the password is correct or not
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    console.log('Is password matched: ', isPasswordMatch);
    if(!isPasswordMatch){
      return res.status(400).json({
        success: false,
        message: 'Password doesnot match'
      });
    }
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    //update the user password
    user.password = newHashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "password Updated Successfully"
    })  
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};

module.exports = { registerUser, loginUser, changePassword };
