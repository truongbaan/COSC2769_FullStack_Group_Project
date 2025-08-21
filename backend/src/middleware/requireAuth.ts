/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

import { type Request, type Response, type NextFunction } from 'express'
import { ErrorJsonResponse } from "../utils/json_mes"
import { supabase } from "../db/db"
import { UserService } from '../service/user.service'

declare global {
    namespace Express {
        interface Request {
            user_id: string;
        }
    }
}

export function requireAuth(role: string | string[] = '') {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies.access_token
        if (!token) {
            return ErrorJsonResponse(res, 401, 'No token provided')
        }
        
        // Verify token with Supabase
        const { data, error } = await supabase.auth.getUser(token)
        if (error || !data.user) {
            return ErrorJsonResponse(res, 401, 'Unauthorized: Invalid token')
        }
        
        const roles: string[] =
            typeof role === 'string' ? role
                    ? [role] // non-empty string → wrap in array
                    : []     // empty string → no restriction
                : role;
        
        if (roles.length > 0) {
            const user = await UserService.getUserById(data.user.id, false);
            if (!user) {
                return ErrorJsonResponse(res,404,'Unknown user in database but valid in auth! PLEASE delete that user from auth!');
            }
            if (!roles.includes(user.role)) {
                return ErrorJsonResponse(res,403,`Unauthorized: only roles [${roles.join(', ')}] can access this resource`);
            }
        }
        req.user_id = data.user.id//return user_id field for other controller uses
        next();
    };
}