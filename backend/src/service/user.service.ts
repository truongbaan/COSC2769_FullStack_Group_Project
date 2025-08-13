import { supabase, Database } from "../db/db"
import { CustomerService } from "./customer.service"

export type User = Database['public']['Tables']['users']['Row']

export const UserService = {
    /** Fetch all users*/
    async getAllUsers(): Promise<User[] | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('id', { ascending: false })

        //DEBUG, will be remove
        console.log('📊 Raw Supabase response:')
        console.log('  - Data:', data)
        console.log('  - Error:', error)
        console.log('  - Data length:', data?.length)
        //

        if (error) {
            console.error('Error fetching user:', error)
            throw error
        }
        console.log(data)

        if (!data) {
            return null  // explicitly return null to trigger 404 in route
        }
        return data
    },

    /** Fetch a single user by id */
    async getUserById(id: string ): Promise<User | null> {
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
        
        switch(data.role){
            case "customer":
                const customer_data = await CustomerService.getCustomerById(data.id)
                return { ...data, ...customer_data}
            case "shipper":
                return null
            case "vendor":
                return null
        }

        return null
    },

    //for login through authentication
    async getUserByEmail(email: string ): Promise<User | null> {
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.trim().toLowerCase())
            .maybeSingle()

        if (error) {
            console.error(`Error fetching user ${email}:`, error)
            throw error
        }
        if (!data || !data.role) {
            return null  // explicitly return null to trigger 404 in route
        }
        
        switch(data.role){
            case "customer":
                const customer_data = await CustomerService.getCustomerById(data.id)
                return { ...data, ...customer_data}
            case "shipper":
                return null
            case "vendor":
                return null
        }

        return null
    },

    async createUser(user : User): Promise<User | null> {
        const {data, error} = await supabase
            .from('customers')
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
    }
}