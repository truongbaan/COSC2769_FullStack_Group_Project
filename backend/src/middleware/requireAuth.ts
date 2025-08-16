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

export function requireAuth(role: string = '') {
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
        if (role) {
            const user = await UserService.getUserById(data.user.id)
            if (!user || !user.role || user.role !== role) {
                return ErrorJsonResponse(res, 401, `Unauthorized: only role ${role} can modify this table`)
            }
        }
        next();
    };
}