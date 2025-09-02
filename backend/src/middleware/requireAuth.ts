/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

import { type Request, type Response, type NextFunction } from 'express'
import { ErrorJsonResponse } from "../utils/json_mes"
import { Database, supabase } from "../db/db"
import { UserService } from '../service/user.service'

declare global {
    namespace Express {
        interface Request {
            user_id: string;
            user_role: Database['public']['Tables']['users']['Row']['role']; // for verifying role of router with multiple role allowed
        }
    }
}

export function requireAuth(role: string | string[] = '') {
    return async (req: Request, res: Response, next: NextFunction) => {
        let token = req.cookies.access_token
        const refreshToken = req.cookies.refresh_token;
        if (!token) {
            return ErrorJsonResponse(res, 401, 'No token provided')
        }

        // Verify token with Supabase
        let { data, error } = await supabase.auth.getUser(token)

        if (error || !data.user) {//fail to verify, check if access token is expired
            if (!refreshToken) {
                return ErrorJsonResponse(res, 401, 'Unauthorized: Invalid token and no refresh token');
            }

            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                refresh_token: refreshToken,
            });

            if (refreshError || !refreshData.session) {
                return ErrorJsonResponse(res, 401, 'Unauthorized: Unable to refresh session');
            }

            console.log("Detect access token expired, attempt to refresh")

            // update cookies with new tokens
            res.cookie('access_token', refreshData.session.access_token, {
                httpOnly: true,
                secure: process.env.PRODUCTION_SITE === 'true',
                path: '/',
            });

            res.cookie('refresh_token', refreshData.session.refresh_token, {
                httpOnly: true,
                secure: process.env.PRODUCTION_SITE === 'true',
                path: '/',
            });
            await supabase.auth.setSession(refreshData.session);
            token = refreshData.session.access_token;
            
            ({ data, error } = await supabase.auth.getUser(token));
            if (error || !data.user) {
                return ErrorJsonResponse(res, 401, 'Unauthorized: Invalid after refresh');
            }
        }

        const roles: string[] =
            typeof role === 'string' ? role
                ? [role] // non-empty string → wrap in array
                : []     // empty string → no restriction
                : role;

        //get user info
        const user = await UserService.getUserById(data.user.id, false);
        if (!user) {
            return ErrorJsonResponse(res, 404, 'Unknown user in database but valid in auth! PLEASE delete that user from auth!');
        }

        if (roles.length > 0) {
            if (!roles.includes(user.role)) {
                return ErrorJsonResponse(res, 403, `Unauthorized: only roles [${roles.join(', ')}] can access this resource`);
            }
        }
        req.user_role = user.role
        req.user_id = data.user.id//return user_id field for other controller uses
        next();
    };
}