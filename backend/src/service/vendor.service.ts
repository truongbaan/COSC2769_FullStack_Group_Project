/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

import { supabase, Database } from "../db/db"
import { Pagination } from "../types/general.type"
import { ImageService } from "./image.service"
import { debugLog, debugError } from '../utils/debug';

export type Vendor = Database['public']['Tables']['vendors']['Row']
type VendorUpdate = Database['public']['Tables']['vendors']['Update'] & { id: string }
type FullVendor = Vendor & {
    email: string,
    username: string,
    profile_picture: string,
}
export const VendorService = {

    async getVendors({ page, size }: Pagination): Promise<FullVendor[] | null> {
        const listAll = page === -1 || size === -1;

        let query = supabase
            .from("vendors")
            .select(`
                        *,
                        users (
                            email,
                            username,
                            profile_picture
                        )
                    `)
            .order("id", { ascending: false });

        if (!listAll) {
            const offset = (page - 1) * size;
            query = query.range(offset, offset + size - 1);
        }

        const { data, error } = await query;

        if (error) {
            debugError("Error fetching users:", error);
            throw error;
        }

        if (!data) return null;
        const withAdjustedImages = await Promise.all(
            data.map(async (vendor) => {
                let profile_picture = "";

                if (vendor.users?.profile_picture) {
                    const result = await ImageService.getPublicImageUrl(
                        vendor.users.profile_picture,
                        "profileimages"
                    );

                    if (result.success && result.url) {
                        profile_picture = result.url;
                    }
                }

                return {
                    ...vendor,
                    users: {
                        ...vendor.users,
                        profile_picture, // always string
                    },
                };
            })
        );

        //flatten data
        return withAdjustedImages.map(Vendor => {
            const { users, ...restOfVendor } = Vendor;

            return {
                ...restOfVendor,
                ...users
            };
        });
    },

    /** Fetch a single Vendor by id */
    //also use in authen
    async getVendorById(id: string): Promise<Vendor | null> {
        const { data, error } = await supabase
            .from('vendors')
            .select('*')
            .eq('id', id.trim().toLocaleLowerCase())
            .maybeSingle()

        debugLog(data)

        if (error) {
            debugError(`Error fetching Vendor ${id}:`, error)
            throw error
        }
        if (!data) {
            return null  // explicitly return null to trigger 404 in route
        }

        return data
    },

    //create
    async createVendor(vendor: Vendor): Promise<Vendor | null> {
        const { data, error } = await supabase
            .from('vendors')
            .insert({
                id: vendor.id,
                business_name: vendor.business_name,
                business_address: vendor.business_address
            })
            .select()
            .maybeSingle();

        if (error || !data) {
            debugError('Error creating vendor:', error);
            return null;
        }

        return data;
    },

    async updateVendor({ id, business_address, business_name }: VendorUpdate): Promise<boolean> {
        const { error } = await supabase
            .from('vendors')
            .update({
                business_address,
                business_name
            })
            .eq('id', id);
        if (error) {
            debugError(`Error updating vendor ${id}:`, error);
            return false;
        }
        return true;
    }

}