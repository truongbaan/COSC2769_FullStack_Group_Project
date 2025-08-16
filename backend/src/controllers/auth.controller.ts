/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

import * as z from "zod";
import { Request, Response } from "express";
import { signInUser } from "../db/db";
import { ErrorJsonResponse, SuccessJsonResponse } from "../utils/json_mes";
import { UserService } from "../service/user.service";

export const loginBodySchema = z.object({
    email: z.string(),
    password: z.string()
}).strict();

export const registerCustomerBodySchema = z.object({
    email: z.string().trim(),
    password: z.string().trim(),
    username: z.string().trim(),
    profile_picture: z.string().trim(),
    role: z.literal("customer"),
    address: z.string().trim(),
    name: z.string().trim()
}).strict();

export const registerShipperBodySchema = z.object({
    email: z.string().trim(),
    password: z.string().trim(),
    username: z.string().trim(),
    profile_picture: z.string().trim(),
    role: z.literal("shipper"),
    hub_id: z.string().trim()
}).strict();

export const registerVendorBodySchema = z.object({
    email: z.string().trim(),
    password: z.string().trim(),
    username: z.string().trim(),
    profile_picture: z.string().trim(),
    role: z.literal("shipper"),
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
        
        if (user === null) {//this mean the user is created in authen but not in the db table (!critical if happens)
            return ErrorJsonResponse(res, 404, "WARNING! Unknown user in db but found in authentication!")
        }
        
        //add cookies :>
        res.cookie('access_token', session.access_token, {
            httpOnly: true,
            secure: process.env.PRODUCTION_SITE === 'true', // http or https
            path: '/',
        })
        
        //could be removed since not use, but might use later
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