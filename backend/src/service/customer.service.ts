import { supabase, Database } from "../db/db"

export type Customer = Database['public']['Tables']['customers']['Row']

export const CustomerService = {
    /** Fetch all Customers*/
    async getAllCustomers(): Promise<Customer[] | null> {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('id', { ascending: false })

        //DEBUG, will be remove
        console.log('📊 Raw Supabase response:')
        console.log('  - Data:', data)
        console.log('  - Error:', error)
        console.log('  - Data length:', data?.length)
        //

        if (error) {
            console.error('Error fetching Customer:', error)
            throw error
        }
        console.log(data)

        if (!data) {
            return null  // explicitly return null to trigger 404 in route
        }
        return data
    },

    /** Fetch a single Customer by id */
    async getCustomerById(id: string ): Promise<Customer | null> {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id.trim().toLocaleLowerCase())
            .maybeSingle()

        console.log(data)

        if (error) {
            console.error(`Error fetching Customer ${id}:`, error)
            throw error
        }
        if (!data) {
            return null  // explicitly return null to trigger 404 in route
        }

        return data
    },

    //for login through authentication
    async getCustomerByEmail(email: string ): Promise<Customer | null> {
        
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('email', email.trim().toLowerCase())
            .maybeSingle()

        if (error) {
            console.error(`Error fetching Customer ${email}:`, error)
            throw error
        }
        if (!data) {
            return null  // explicitly return null to trigger 404 in route
        }
        
        return data //return id, address, name field
    },

    async createCustomer(customer : Customer) : Promise<Customer | null> {
        const {data, error} = await supabase
            .from('customers')
            .insert({
                id: customer.id,
                name: customer.name,
                address: customer.address
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