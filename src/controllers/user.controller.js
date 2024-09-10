import { asyncHandler } from "../utility/asyncHandker.js";
import { ApiError } from "../utility/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utility/cloudinary.js"
import { ApiResponse } from "../utility/ApiResponse.js";

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


export { registerUser }