/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

import * as z from "zod";
import { Request, Response } from "express";
import { signInUser, signOutUser } from "../db/db";
import { ErrorJsonResponse, SuccessJsonResponse } from "../utils/json_mes";
import { UserService } from "../service/user.service";
import { AuthService } from "../service/auth.service";
import { passwordSchema, usernameSchema } from "../types/general.type";

export const loginBodySchema = z.object({
    email: z.email("Invalid email format").trim(),
    password: passwordSchema
}).strict(); 

export const registerCustomerBodySchema = z.object({
    email: z.email("Invalid email format").trim(),
    password: passwordSchema,
    username: usernameSchema,
    address: z.string().trim(),
    name: z.string().trim()
}).strict();

export const registerShipperBodySchema = z.object({
    email: z.email("Invalid email format").trim(),
    password: passwordSchema,
    username: usernameSchema,
    hub_id: z.string().trim()
}).strict();

export const registerVendorBodySchema = z.object({
    email: z.email("Invalid email format").trim(),
    password: passwordSchema,
    username: usernameSchema,
    business_address: z.string().trim(),
    business_name: z.string().trim()
}).strict();

export const loginController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const session = await signInUser(email, password)

        if (!session) {
            return ErrorJsonResponse(res, 401, 'Invalid credentials')
        }

        //get user through id
        const user = await UserService.getUserById(session.user.id)

        if (!user) {//this mean the user is created in authen but not in the db table (!critical if happens)
            return ErrorJsonResponse(res, 404, "WARNING! Unknown user in db but found in authentication!")
        }

        //add cookies :>
        res.cookie('access_token', session.access_token, {
            httpOnly: true,
            secure: process.env.PRODUCTION_SITE === 'true', // http or https
            path: '/',
        })

        // use when access token expired
        res.cookie('refresh_token', session.refresh_token, {
            httpOnly: true,
            secure: process.env.PRODUCTION_SITE === 'true', // http or https
            path: '/',
        })

        // Return success with tokens
        SuccessJsonResponse(res, 200, {
            data: {
                user: user
            }
        })

    } catch (error) {
        ErrorJsonResponse(res, 500, 'Internal server error')
    }
}

export const registerCustomerController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result = await AuthService.registerCustomer(req.body);

        if (!result.success) {
            return ErrorJsonResponse(res, 400, result.error!);
        }
        //add cookies :>
        addCookie(res, result.data!);
        
        return SuccessJsonResponse(res, 200, {
            data: {
                user: result.data!.user
            }
        });
        
    } catch (error) {
        return ErrorJsonResponse(res, 500, 'Internal server error');
    }
};

export const registerShipperController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result = await AuthService.registerShipper(req.body);
        
        if (!result.success) {
            return ErrorJsonResponse(res, 400, result.error!);
        }
        
        //add cookies :>
        addCookie(res, result.data!);
        
        return SuccessJsonResponse(res, 200, {
            data: {
                user: result.data!.user
            }
        });
        
    } catch (error) {
        return ErrorJsonResponse(res, 500, 'Internal server error');
    }
};

export const registerVendorController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result = await AuthService.registerVendor(req.body);

        if (!result.success) {
            return ErrorJsonResponse(res, 400, result.error!);
        }
        
        addCookie(res, result.data!);
        
        return SuccessJsonResponse(res, 200, {
            data: {
                user: result.data!.user
            }
        });
        
    } catch (error) {
        return ErrorJsonResponse(res, 500, 'Internal server error');
    }
};

//for adding of all cookies when signUp or signIn
function addCookie(res : Response, session : any){
    res.cookie('access_token', session.access_token, {
            httpOnly: true,
            secure: process.env.PRODUCTION_SITE === 'true', // http or https
            path: '/',
    })
    
    res.cookie('refresh_token', session.refresh_token, {
        httpOnly: true,
        secure: process.env.PRODUCTION_SITE === 'true', // http or https
        path: '/',
    })
}

export const logoutController = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.access_token
        if (!token) {
            return ErrorJsonResponse(res, 401, 'Not logged in')
        }
        
        const result = await signOutUser()
        if (!result){
            return ErrorJsonResponse(res, 500, 'Fail to sign out user')
        }
        // Clear cookies
        res.clearCookie('access_token', { path: '/' })
        res.clearCookie('refresh_token', { path: '/' })
        
        SuccessJsonResponse(res, 200, 'Logged out successfully' )
    } catch (error) {
        ErrorJsonResponse(res, 500, 'Internal server error')
    }
}
