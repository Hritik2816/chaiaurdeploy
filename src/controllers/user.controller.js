import { asyncHandler } from "../utility/asyncHandker.js";
import { ApiError } from "../utility/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utility/cloudinary.js"
import { ApiResponse } from "../utility/ApiResponse.js";


const generateAccessAndRefreshTokens = async (userId) => {
  try {

    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return (accessToken, refreshToken)

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullName, email, username, password } = req.body
  // console.log("email: ", email)


  // if (fullName === "") {
  //   throw new ApiError(400, "fullname is required")
  // }

  if (
    [fullName, email, username, password].some((field) =>
      field?.trim() === "")
  ) {
    throw new ApiError(400, "All field are required")
  }


  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "User already exists")
  }
  // console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed")
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username: username.toLowerCase(),
    password,
  })
  // console.log(user);


  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
  )
})

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  //username or mail
  //find the user
  //password check
  //access and refersh token
  //send cookie

  const { email, username, password } = req.body

  if (!username || !email) {
    throw new ApiError(400, "username or email is required")
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],

  })
  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid = await user.isPasswordValid(password

  )
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refresh")

  const option = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {

        }
      )
    )
})


export {
  registerUser,
  loginUser
}