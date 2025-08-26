/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen Vo Truong Toan
# ID: s3979056 */

import * as z from "zod";
import { ErrorJsonResponse } from "../utils/json_mes";
import { NextFunction, Request, Response } from "express";

export const validationMiddleware = (schema: z.Schema, validationPart: 'body' | 'params' | 'query') => (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = schema.parse(req[validationPart]); // req['body'] <=> req.body
        const validatedKeyword = `validated${validationPart}`; // => validatedparams | validatedbody | validatedquery
        (req as unknown as Record<string, unknown>)[validatedKeyword] = validatedData;
        next();
    } catch (err) {
        // ErrorJsonResponse(res, 400, (err as Error).message);
        if (err instanceof z.ZodError) {
            const fields = Array.from(new Set(err.issues.map(i => i.path.join(".")))).join(", ");
            return res.status(400).json({
                success: false,
                message: "Please provide valid values for: " + fields,
            });
        }
        return ErrorJsonResponse(res, 400, (err as Error).message);
    }
}