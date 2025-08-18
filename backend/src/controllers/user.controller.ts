/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */
import { Request, Response } from "express"
import { z } from "zod"
import { UserService } from "../service/user.service"
import { ErrorJsonResponse, SuccessJsonResponse } from "../utils/json_mes"

export const getUsersQuerySchema = z.object({
    page: z.string().default("-1").transform((val) => parseInt(val, 10)),
    size: z.string().default("-1").transform((val) => parseInt(val, 10)),
    role: z.enum(["customer", "shipper", "vendor", "all"]).optional().default("all"),
}).strict();

type GetUsersQueryType = z.output<typeof getUsersQuerySchema>;

export const getUsersController = async (req: Request, res: Response) => {
    try {
        const { page, size, role } = (req as unknown as Record<string, unknown> & {
            validatedquery: GetUsersQueryType
        }).validatedquery;

        const users = await UserService.getUsers({ page, size }, { role });

        if (users === null) {
            return ErrorJsonResponse(res, 500, "Failed to fetch users");
        }
        
        return SuccessJsonResponse(res, 200, {
            data: { users, count: users.length },
        });
    } catch (err: any) {
        if (err?.issues) {
            return ErrorJsonResponse(res, 400, err.issues[0].message);
        }
        return ErrorJsonResponse(res, 500, "Unexpected error while fetching users");
    }
};

//use req.body
export const getUserByIdParamsSchema = z.object({
    id: z.string(),
}).strict()

type GetUserByIdParamsType = z.output<typeof getUserByIdParamsSchema>

export const getUserByIdController = async (req: Request, res: Response) => {
    try {
        const { id} = (req as unknown as Record<string, unknown> & {
            validatedparams: GetUserByIdParamsType
        }).validatedparams

        const user = await UserService.getUserById(id, true)

        if (!user) {
            return ErrorJsonResponse(res, 404, "User not found")
        }
        return SuccessJsonResponse(res, 200, { data: user })
    } catch (err: any) {
        if (err?.issues) {
            return ErrorJsonResponse(res, 400, err.issues[0].message)
        }
        return ErrorJsonResponse(res, 500, "Unexpected error while fetching user")
    }
}

//same like get user by id, but might be other field added in get user by id, dont group them!
export const deleteUserByIdParamsSchema = z.object({
    id: z.string(),
}).strict()

type DeleteUserByIdParamsType = z.output<typeof getUserByIdParamsSchema>

//use req.param
export const deleteUserController = async (req: Request, res: Response) => {
    try {
        const {id} = (req as unknown as Record<string, unknown> & {
            validatedparams: DeleteUserByIdParamsType
        }).validatedparams;

        const deleted = await UserService.deleteUser(id)
        if (!deleted) {
            return ErrorJsonResponse(res, 500, "Failed to delete user")
        }
        return SuccessJsonResponse(res, 200, { message: "User deleted successfully" })
    } catch (err: any) {
        if (err?.issues) {
            return ErrorJsonResponse(res, 400, err.issues[0].message)
        }
        return ErrorJsonResponse(res, 500, "Unexpected error while deleting user")
    }
}