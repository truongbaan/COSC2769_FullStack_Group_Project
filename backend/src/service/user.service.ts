/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

import { supabase, Database } from "../db/db"
import { CustomerService } from "./customer.service"
import { ShipperService } from "./shipper.service"
import { VendorService } from "./vendor.service"
import { Pagination } from "../types/general.type"

export type UsersFilters = {
    role: 'customer' | 'shipper' | 'vendor' | 'all'
}
export type User = Database['public']['Tables']['users']['Row']

export const UserService = {
    /** Fetch all users*/
    // async getAllUsers(): Promise<User[] | null> {
    //     const { data, error } = await supabase
    //         .from('users')
    //         .select('*')
    //         .order('id', { ascending: false })

    //     //DEBUG, will be remove
    //     console.log('📊 Raw Supabase response:')
    //     console.log('  - Data:', data)
    //     console.log('  - Error:', error)
    //     console.log('  - Data length:', data?.length)
    //     //

    //     if (error) {
    //         console.error('Error fetching user:', error)
    //         throw error
    //     }
    //     console.log(data)

    //     if (!data) {
    //         return null  // explicitly return null to trigger 404 in route
    //     }
    //     return data
    // },

    async getUsers({ page, size }: Pagination, filters: UsersFilters): Promise<User[] | null> {
        const listAll = page === -1 || size === -1;

        let query = supabase
            .from("users")
            .select("*")
            .order("id", { ascending: false });

        if (filters.role !== 'all') {
            query = query.eq("role", filters.role);
        }

        if (!listAll) {
            const offset = (page - 1) * size;
            query = query.range(offset, offset + size - 1);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching users:", error);
            throw error;
        }

        if (!data) return null;
        return data;
    },

    /** Fetch a single user by id */
    //also get data for authen
    async getUserById(id: string, full_info: boolean = true): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        console.log(data)

        if (error) {
            console.error(`Error fetching user ${id}:`, error)
            throw error
        }
        if (!data || !data.role) {
            return null  // explicitly return null to trigger 404 in route
        }

        if (!full_info) {
            return data
        }
        let role_data = null
        switch (data.role) {
            case "customer":
                role_data = await CustomerService.getCustomerById(data.id)
                break
            case "shipper":
                role_data = await ShipperService.getShipperById(data.id)
                break
            case "vendor":
                role_data = await VendorService.getVendorById(data.id)
                break
        }

        //found full info
        if (role_data) {
            return { ...data, ...role_data }
        }

        return null
    },

    async createUser(user: User): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .insert({
                id: user.id,
                email: user.email,
                password: user.password,
                username: user.username,
                profile_picture: user.profile_picture,
                role: user.role
            })
            .select()
            .maybeSingle();

        if (error || !data) {
            console.error('Error creating customer:', error);
            return null;
        }

        return data;
    },

    async deleteUser(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)

        if (error) {
            console.error(`Error deleting user ${id}:`, error)
            return false
        }

        return true
    }
}