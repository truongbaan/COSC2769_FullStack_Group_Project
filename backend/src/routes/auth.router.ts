/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

import { Router, Request, Response } from 'express';
import { changePassword, signInUser, signUpUser } from '../db/db';
import { ErrorJsonResponse, SuccessJsonResponse } from '../utils/json_mes';
import { requireAuth } from '../middleware/requireAuth'

const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        
        if (!email || !password) {
            return ErrorJsonResponse(res, 400, 'Email and password are required')
        }
        
        const session = await signInUser(email, password)
        
        if (!session) {
            return ErrorJsonResponse(res, 401, 'Invalid credentials')
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
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                user: session.user
            }
        })
        
    } catch (error) {
        ErrorJsonResponse(res, 500, 'Internal server error')
    }
})

authRouter.post('/signup', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        
        // Validate input
        if (!email || !password) {
            return ErrorJsonResponse(res, 400, 'Email and password are required')
        }
        const session = await signUpUser(email, password)
        
        if (!session) {
            return ErrorJsonResponse(res, 400, 'Error creating user, or user already exists.')
        }
        
        //add cookie
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
        
        SuccessJsonResponse(res, 200, {
            data: {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                user: session.user
            }
        })
        
    } catch (error) {
        ErrorJsonResponse(res, 500, 'Internal server error')
    }
})

//change password for authen, for db, would go after user router instead
authRouter.post('/changepassword', requireAuth, async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        
        if (!email || !password) {
            return ErrorJsonResponse(res, 400, 'Email and password are required')
        }

        const session = await changePassword(password)
        
        if (!session) {
            return ErrorJsonResponse(res, 400, 'Error can not change password.')
        }
        
        SuccessJsonResponse(res, 200, 'Successfully change password')
        
    } catch (error) {
        ErrorJsonResponse(res, 500, 'Internal server error')
    }
})

export default authRouter;