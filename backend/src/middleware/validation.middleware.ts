/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen Vo Truong Toan
# ID: s3979056 */

import * as z from "zod";
import { ErrorJsonResponse } from "../utils/json_mes";
import { NextFunction, Request, Response } from "express";

/**
 * Middleware for validating request data using Zod schemas
 * @param schema - The Zod schema to validate against
 * @param validationPart - Which part of the request to validate ('body', 'params', or 'query')
 * @returns Express middleware function that validates the specified request part
 */
export const validationMiddleware =
  (schema: z.Schema, validationPart: "body" | "params" | "query") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate the data from the specified part of the request
      const validatedData = schema.parse(req[validationPart]); // req['body'] <=> req.body
      // Create a property name for storing the validated data (e.g., 'validatedbody')
      const validatedKeyword = `validated${validationPart}`; // => validatedparams | validatedbody | validatedquery
      // Attach the validated data to the request object for use in subsequent middleware/handlers
      (req as unknown as Record<string, unknown>)[validatedKeyword] =
        validatedData;
      // Continue to the next middleware/handler
      next();
    } catch (err) {
      // Handle Zod validation errors
      if (err instanceof z.ZodError) {
        // Extract field names with errors and join them into a comma-separated string
        const fields = Array.from(
          new Set(err.issues.map((i) => i.path.join(".")))
        ).join(", ");
        // Return a 400 Bad Request response with the field names that failed validation
        return res.status(400).json({
          success: false,
          message: "Please provide valid values for: " + fields,
        });
      }
      // Handle other types of errors using the utility function
      return ErrorJsonResponse(res, 400, (err as Error).message);
    }
  };
