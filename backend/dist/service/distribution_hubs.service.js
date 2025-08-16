"use strict";
/* RMIT University Vietnam
# Course: COSC2769 - Full Stack Development
# Semester: 2025B
# Assessment: Assignment 02
# Author:
# ID:  */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionHubService = void 0;
const db_1 = require("../db/db");
exports.DistributionHubService = {
    /** Fetch all distribution hubs*/
    async getAllDistributionHubs({ page, size }) {
        const offset = (page - 1) * size;
        const { data, error } = await db_1.supabase
            .from('distribution_hubs')
            .select('*')
            .order('id', { ascending: false })
            .range(offset, offset + size - 1);
        //DEBUG, will be remove
        console.log('📊 Raw Supabase response:');
        console.log('  - Data:', data);
        console.log('  - Error:', error);
        console.log('  - Data length:', data?.length);
        //
        if (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
        console.log(data);
        if (!data) {
            return null; // explicitly return null to trigger 404 in route
        }
        return data;
    },
};
