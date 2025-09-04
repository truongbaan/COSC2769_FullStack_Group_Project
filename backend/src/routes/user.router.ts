/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

import { Router } from "express";
import {
  getUsersQuerySchema,
  getUsersController,
  getUserByIdController,
  getUserByIdParamsSchema,
  deleteUserController,
  updateUserByIdParamsSchema,
  updateUserByIdController,
  uploadProfilePictureController,
} from "../controllers/user.controller";
import { validationMiddleware } from "../middleware/validation.middleware";
import multer from "multer";

const upload = multer(); // memory storage
const UserRouter = Router();
//for query get multiple users
UserRouter.get(
  "/",
  validationMiddleware(getUsersQuerySchema, "query"),
  getUsersController
); //return list of User[]
//for single user
UserRouter.get(
  "/:id",
  validationMiddleware(getUserByIdParamsSchema, "params"),
  getUserByIdController
); //return User
//delete user
UserRouter.delete("/me", deleteUserController);
//update password
UserRouter.patch(
  "/update-password",
  validationMiddleware(updateUserByIdParamsSchema, "body"),
  updateUserByIdController
);
//upload image
UserRouter.post(
  "/upload-image",
  upload.single("file"),
  uploadProfilePictureController
);
export default UserRouter;
