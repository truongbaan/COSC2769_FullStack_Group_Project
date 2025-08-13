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
import { User, UserService } from '../service/user.service';
import {hasUnknownFields} from '../utils/validation';
import { Customer, CustomerService } from '../service/customer.service';

const authRouter = Router();
const allowedFieldForRegister = ['id', 'email', 'password', 'username', 'profile_picture', 'role', 'name', 'address', 'hub_id', 'business_name', 'business_address'];

authRouter.post('/login', async (req: Request, res: Response) => {
    try {
        //check if the body is valid or not
        const Invalid = hasUnknownFields(allowedFieldForRegister, req.body);
        if (Invalid){
            return ErrorJsonResponse(res, 400, "Unknown fields detect in request")
        }

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

        //get user through id
        const user = await UserService.getUserById(session.user.id)

        if(user === null){//this mean the user is created in authen but not in the db table (!critical if happens)
            return ErrorJsonResponse(res, 404, "Unknown user")
        }

        // Return success with tokens
        SuccessJsonResponse(res, 200, {
            data: {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
            }
        })
        
    } catch (error) {
        ErrorJsonResponse(res, 500, 'Internal server error')
    }
})

authRouter.post('/signup', async (req: Request, res: Response) => {
    try {
        const Invalid = hasUnknownFields(allowedFieldForRegister, req.body);
        if (Invalid){
            return ErrorJsonResponse(res, 400, "Unknown fields detect in request")
        }

        const { email, password } = req.body
        
        // Validate input
        if (!email || !password) {
            return ErrorJsonResponse(res, 400, 'Email and password are required')
        }
        //try signup
        const session = await signUpUser(email, password)
        
        if (!session) {
            return ErrorJsonResponse(res, 400, 'Error creating user, or user already exists.')
        }
        //how to check for all field need before create the temp_user to add?
        
        const temp_user : User = {
            id: session.user.id,
            email: req.body.email,
            password: req.body.password,
            username: req.body.username,
            profile_picture: req.body.profile_picture,
            role: req.body.role
        }

        const user = await UserService.createUser(temp_user)
        let data_return = null // init

        if(!user){
            return ErrorJsonResponse(res, 400, 'Error creating user in db users')
        }

        switch(req.body.role){
            case "customer":
                const temp_customer : Customer = {
                    id: session.user.id,
                    address: req.body.address,
                    name: req.body.name,
                }
                const customer = await CustomerService.createCustomer(temp_customer)
                if(!customer){
                    return ErrorJsonResponse(res, 400, "Fail to create customer at db customer")
                }
                data_return = { ...user, ...customer}
                break
            case "shipper":
                return ErrorJsonResponse(res, 400, 'Shipper role not yet supported');
            case "vendor":
                return ErrorJsonResponse(res, 400, 'Vendor role not yet supported');
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
                user: data_return
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