import { supabase } from "../db/db"

export const UserService = {
    /** Fetch all users*/
    async getAllUsers(): Promise<any[]> {
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
        return data!
    },

    /** Fetch a single user by id */
    async getUserById(id: string | any): Promise<any> {
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
        if (!data) {
            return null  // explicitly return null to trigger 404 in route
        }

        return data
    },
}