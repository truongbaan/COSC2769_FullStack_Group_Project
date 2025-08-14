import { supabase, Database } from "../db/db"

export type Vendor = Database['public']['Tables']['vendors']['Row']

export const VendorService = {
    /** Fetch all Vendors*/
    async getAllVendors(): Promise<Vendor[] | null> {
        const { data, error } = await supabase
            .from('Vendors')
            .select('*')
            .order('id', { ascending: false })

        //DEBUG, will be remove
        console.log('📊 Raw Supabase response:')
        console.log('  - Data:', data)
        console.log('  - Error:', error)
        console.log('  - Data length:', data?.length)
        //

        if (error) {
            console.error('Error fetching Vendor:', error)
            throw error
        }
        console.log(data)

        if (!data) {
            return null  // explicitly return null to trigger 404 in route
        }
        return data
    },

    /** Fetch a single Vendor by id */
    //also use in authen
    async getVendorById(id: string ): Promise<Vendor | null> {
        const { data, error } = await supabase
            .from('vendors')
            .select('*')
            .eq('id', id.trim().toLocaleLowerCase())
            .maybeSingle()

        console.log(data)

        if (error) {
            console.error(`Error fetching Vendor ${id}:`, error)
            throw error
        }
        if (!data) {
            return null  // explicitly return null to trigger 404 in route
        }

        return data
    },

    //create
    async createVendor(vendor : Vendor) : Promise<Vendor | null> {
        const {data, error} = await supabase
            .from('Vendors')
            .insert({
                id: vendor.id,
                bussiness_name: vendor.business_name,
                bussiness_address: vendor.business_address
            })
            .select()
            .maybeSingle();

        if (error || !data) {
            console.error('Error creating Vendor:', error);
            return null;
        }

        return data;
    }
}