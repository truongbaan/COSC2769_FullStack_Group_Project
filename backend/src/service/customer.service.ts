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

export type Customer = Database['public']['Tables']['customers']['Row']
type CustomerUpdate = Database['public']['Tables']['customers']['Update'] & { id: string }
type FullCustomer = {
    id: string,
    name: string,
    address: string,
    email: string,
    username: string,
    profile_picture: string,
}

export const CustomerService = {
    async getCustomers({ page, size }: Pagination): Promise<FullCustomer[] | null> {
        const listAll = page === -1 || size === -1;

        let query = supabase
            .from("customers")
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

        // DEBUG
        debugLog('📊 Raw Supabase response:')
        debugLog('  - Data:', data)
        debugLog('  - Error:', error)
        debugLog('  - Data length:', data?.length)
        //

        if (error) {
            debugError("Error fetching users:", error);
            throw error;
        }

        if (!data) return null;

        const withAdjustedImages = await Promise.all(
            data.map(async (customer) => {
                let profile_picture = "";
                    
                if (customer.users?.profile_picture) {
                    const result = await ImageService.getPublicImageUrl(
                        customer.users.profile_picture,
                        "profileimages"
                    );
                    
                    if (result.success && result.url) {
                        profile_picture = result.url;
                    }
                }
                    
                return {
                    ...customer,
                    users: {
                        ...customer.users,
                        profile_picture, // always string
                    },
                };
            })
        );
        
        //flatten data
        return withAdjustedImages.map(customer => {
            const { users, ...restOfCustomer } = customer;

            return {
                ...restOfCustomer,
                ...users
            };
        });
    },

    /** Fetch a single Customer by id */
    async getCustomerById(id: string): Promise<Customer | null> {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id.trim().toLocaleLowerCase())
            .maybeSingle()

        debugLog(data)

        if (error) {
            debugError(`Error fetching Customer ${id}:`, error)
            throw error
        }
        if (!data) {
            return null  // explicitly return null to trigger 404 in route
        }

        return data
    },

    async createCustomer(customer: Customer): Promise<Customer | null> {
        debugLog("Customer data in createCustomer", customer)
        const { data, error } = await supabase
            .from('customers')
            .insert({
                id: customer.id,
                name: customer.name,
                address: customer.address
            })
            .select()
            .maybeSingle();

        if (error || !data) {
            debugError('Error creating customer:', error);
            return null;
        }

        return data;
    },

    async updateCustomer({ id, address, name }: CustomerUpdate): Promise<boolean> {
        const { error } = await supabase
            .from('customers')
            .update({
                address,
                name
            })
            .eq('id', id);
        if (error) {
            debugError(`Error updating customer ${id}:`, error);
            return false;
        }
        return true;
    }, 
}