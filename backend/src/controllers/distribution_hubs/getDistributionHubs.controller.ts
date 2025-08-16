/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: 
# ID:  */

import * as z from "zod";
import { Request, Response } from "express";
import { DistributionHubService } from "../../service/distribution_hubs.service";
import { ErrorJsonResponse, SuccessJsonResponse } from "../../utils/json_mes";

export const getAllHubsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(50).default(20),
});

export const getAllDistributionHubsController = async (req: Request, res: Response) => {
    try {
        const { page, size } = getAllHubsQuerySchema.parse(req.query);

        const hubs = await DistributionHubService.getAllDistributionHubs({ page, size });
        if (hubs === null) {
            return ErrorJsonResponse(res, 500, "Failed to fetch distribution hubs");
        }

        return SuccessJsonResponse(res, 200, {
            data: { hubs, count: hubs.length, page, size },
        });
    } catch (err: any) {
        if (err?.issues?.length) {
            return ErrorJsonResponse(res, 400, err.issues[0].message || "Invalid query parameters");
        }
        console.error(err);
        return ErrorJsonResponse(res, 500, "Unexpected error while fetching distribution hubs");
    }
};