/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

import { Router} from 'express';
import { getUsersQuerySchema, getUsersController, getUserByIdController, deleteUserController, deleteUserByIdParamsSchema } from '../controllers/user.controller';
import { validationMiddleware } from '../middleware/validation.middleware';

const UserRouter = Router();
//for query get multiple users
UserRouter.get('/', validationMiddleware(getUsersQuerySchema, 'query'), getUsersController); //return list of User[]
//for single user
UserRouter.get('/:id', validationMiddleware(getUsersQuerySchema, 'params'), getUserByIdController);//return User
//delete user
UserRouter.delete('/:id', validationMiddleware(deleteUserByIdParamsSchema, 'params'), deleteUserController);
//update
//not yet
export default UserRouter