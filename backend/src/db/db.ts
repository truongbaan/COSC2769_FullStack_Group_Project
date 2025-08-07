/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

//if needed for Json
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json }
    | Json[]

// ----- Database schema -----
// Define schema once so all CRUD calls infer Row/Insert/Update types automatically
// so later if create new table, could use this for easier coding
// this is not real db yet, just a sample how ut looks like
export interface Database {
    public: {
        Tables: {
            users: {
                // .select() for table 'users'
                Row: {
                    id: string // using uuid to create this
                    username: string
                    password: string
                    profile_picture: string
                    role: string
                }
                // .insert() for table 'users'
                Insert: {
                    username: string
                    password: string
                    profile_picture: string
                    role: string
                }
                // .update() in table 'users'
                Update: {
                    password: string
                    profile_picture: string
                }
            }
            vendors: {
                Row: {
                    id: string // from users id
                    business_name: string
                    business_address: string
                }
                Insert: {
                    id: string // from users id
                    businessname: string
                    business_address: string
                }
                Update: {
                    businessname: string
                    business_address: string
                }
            }
            shippers: {

            }
            orders: {

            }
            order_items: {

            }
            products: {

            }
            shopping_cart: {

            }
            // add other tables here...
        }
        Views: {}
        Functions: {}
        Enums: {}
    }
}

import dotenv from 'dotenv'
dotenv.config()

// Client
const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!


if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Anon Key is missing from environment variables!')
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
    supabaseUrl,
    supabaseKey
)

export async function signInUser(email: string, password: string):
    Promise<null | { user: any; access_token: string; refresh_token: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Error signing in:', error.message)
        return null
    }
    return data.session
}

export async function signUpUser(email: string, password: string):
    Promise<null | { user: any; access_token: string; refresh_token: string }> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Error signing up:', error.message);
        return null;
    }

    return data.session;
}