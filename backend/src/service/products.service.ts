/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen Vo Truong Toan
# ID: s3979056 */

import { supabase, Database } from "../db/db";

import generateUUID from "../utils/generator";
import { ImageService } from "./image.service";

//Use "Row" to return data
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];

//Use "Insert" to create data
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

export type ProductInsertNoId = Omit<ProductInsert, "id">;

export type ProductsFilters = {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  name?: string;
}

export type Pagination = {
  page: number;
  size: number;
}

export type ProductsResult = { products: ProductRow[]; totalProducts: number };

export const ProductService = {
  async getCustomerProducts(pagination?: Pagination, filters?: ProductsFilters,): Promise<ProductsResult | null> {

    const query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("id", { ascending: false });

    if (filters?.category) {
      query.eq('category', filters?.category); // WHERE category = {category}
    }

    if (filters?.priceMin !== undefined) { //no skip 0
      query.gte('price', filters?.priceMin); // WHERE price >= {min}
    }

    if (filters?.priceMax !== undefined) { //no skip 0
      query.lte('price', filters?.priceMax); // WHERE price <= {max}
    }

    if (filters?.name) {
      query.eq('name', filters?.name); // WHERE name = {name}
    }

    // Only paginate when there are both page & size provided
    if (pagination?.page && pagination?.size) {
      const offset = (pagination.page - 1) * pagination.size;
      query.range(offset, offset + pagination.size - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
    console.log(data);

    if (!data) return null;

    for (const r of data as Array<{ image: string | null }>) {
      if (!r.image) {
        r.image = null;
        continue;
      }

      const { url } = await ImageService.getPublicImageUrl(r.image, "productimages");
      r.image = url ?? null;
    }

    return { products: data, totalProducts: count ?? data.length };
  },

  async getVendorProducts(vendorId: string, pagination?: Pagination, filters?: ProductsFilters): Promise<ProductsResult | null> {

    const query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("vendor_id", vendorId)
      .order("id", { ascending: false });

    if (filters?.category) {
      query.eq('category', filters?.category); // WHERE category = {category}
    }

    if (filters?.priceMin !== undefined) { //no skip 0
      query.gte('price', filters?.priceMin); // WHERE price >= {min}
    }

    if (filters?.priceMax !== undefined) { //no skip 0
      query.lte('price', filters?.priceMax); // WHERE price <= {max}
    }

    if (filters?.name) {
      query.eq('name', filters?.name); // WHERE name = {name}
    }

    // Only paginate when there are both page & size provided
    if (pagination?.page && pagination?.size) {
      const offset = (pagination.page - 1) * pagination.size;
      query.range(offset, offset + pagination.size - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
    console.log(data);

    if (!data) return null;

    for (const r of data as Array<{ image: string | null }>) {
      if (!r.image) {
        r.image = null;
        continue;
      }

      const { url } = await ImageService.getPublicImageUrl(r.image, "productimages");
      r.image = url ?? null;
    }

    return { products: data, totalProducts: count ?? data.length };
  },

  //Get Product By Id
  async getProductById(id: string, opts?: { vendorId?: string }): Promise<ProductRow | null> {
    let query = supabase
      .from("products")
      .select("*")
      .eq("id", id);

    if (opts?.vendorId) {
      // Chỉ áp cho vendor: giới hạn về sản phẩm của chính họ
      query = query.eq("vendor_id", opts.vendorId);
    }

    const { data, error } = await query.maybeSingle();

    console.log("data", data);

    if (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }

    if (!data) return null;

    let imageUrl: string | null = null;
    if (data.image) {
      const res = await ImageService.getPublicImageUrl(data.image, "productimages");
      imageUrl = res?.success ? res.url ?? null : null;
    }

    return { ...data, image: imageUrl };
  },

  async createProduct(product: ProductInsertNoId): Promise<ProductRow | null> {
    const toInsert: ProductInsert = { ...product, id: generateUUID() };

    const { data, error } = await supabase
      .from('products')
      .insert(toInsert)
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating product:', error);
      return null;
    }

    return data;
  },



  async updateProduct(
    vendorId: string,
    productId: string,
    name?: string,
    price?: number,
    category?: string,
    description?: string,
    imagePath?: string,
    instock?: boolean,
  ) {

    const toUpdate: Record<string, any> = {};

    if (name !== undefined) toUpdate.name = name;
    if (price !== undefined) toUpdate.price = price;
    if (category !== undefined) toUpdate.category = category;
    if (description !== undefined) toUpdate.description = description;
    if (typeof instock === "boolean") toUpdate.instock = instock;
    if (imagePath) toUpdate.image = imagePath;

    const query = supabase
      .from("products")
      .update(toUpdate)
      .eq("vendor_id", vendorId)
      .eq("id", productId)
      .select("*")
      .maybeSingle();

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
    console.log(data);

    if (!data) { return null; }
    return data;
  },
};