/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: 
# ID:  */

import * as z from "zod";

export const deleteProductParamsSchema = z.object({
    productId: z.string(),
}).strict();

export type DeleteProductParams = z.infer<typeof deleteProductParamsSchema>;