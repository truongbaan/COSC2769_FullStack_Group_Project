/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

import { supabase } from "../db/db";

const allowedMimes = ['image/png', 'image/jpeg'];

interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export const UploadService = {
    async uploadImage(file: Express.Multer.File, bucket: string): Promise<UploadResult> {
        try {
            if (!allowedMimes.includes(file.mimetype)) {
                // Return an error if the file type is not allowed
                return {success: false, error: 'Invalid file type. Only PNG, JPEG are allowed.' };
            }

            const filename = `${Date.now()}-${file.originalname}`;

            // Upload to Supabase Storage
            const { error } = await supabase.storage
                .from(bucket) // bucket name
                .upload(filename, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true,
                });

            if (error) {
                console.error("Error uploading image:", error);
                return { success: false, error: error.message };
            }

            return { success: true, url: filename };
        } catch (err: any) {
            return { success: false, error: "Unexpected error uploading image" };
        }
    }
};
