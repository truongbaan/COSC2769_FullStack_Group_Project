"use strict";
/* RMIT University Vietnam
# Course: COSC2769 - Full Stack Development
# Semester: 2025B
# Assessment: Assignment 02
# Author:
# ID: */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const db_1 = require("../db/db");
exports.ProductService = {
    async getProducts({ page, size }, filters) {
        const offset = (page - 1) * size;
        const query = db_1.supabase
            .from("products")
            .select("*");
        // .range(offset, offset + size - 1)
        // .order("id", { ascending: false });
        // if (filters?.category !== undefined && filters.category !== "") {
        //   query.eq('category', filters?.category); // WHERE category = {category}
        // }
        // if (filters?.price?.min !== undefined) { //no skip 0
        //   query.gte('price', filters?.price?.min); // WHERE price >= {min}
        // }
        // if (filters?.price?.max !== undefined) { //no skip 0
        //   query.lte('price', filters?.price?.max); // WHERE price <= {max}
        // }
        // category là string
        const cat = filters?.category?.trim();
        if (cat)
            query.eq("category", cat);
        // min/max: check !== undefined để không bỏ qua 0
        const min = filters?.price?.min;
        const max = filters?.price?.max;
        if (min !== undefined)
            query.gte("price", min); // price >= min
        if (max !== undefined)
            query.lte("price", max); // price <= max
        // sắp xếp + phân trang sau cùng
        query
            .order("id", { ascending: false })
            .range(offset, offset + size - 1);
        const { data, error } = await query;
        //DEBUG, will be remove
        console.log("📊 Raw Supabase response:");
        console.log("  - Data:", data);
        console.log("  - Error:", error);
        console.log("  - Data length:", data?.length);
        //
        // DEBUG ngắn gọn để soi
        console.log("[filters]", { cat, min, max, page, size });
        if (error) {
            console.error("Error fetching product:", error);
            throw error;
        }
        console.log(data);
        if (!data) {
            return null; // explicitly return null to trigger 404 in route
            // return [];
        }
        return data;
    },
    //Get Product By Id
    async getProductById(id) {
        const { data, error } = await db_1.supabase
            .from("products")
            .select("*")
            .eq("id", id)
            .maybeSingle();
        console.log("data", data);
        if (error) {
            console.error(`Error fetching product ${id}:`, error);
            throw error;
        }
        return data || null;
    },
    async createProduct(product) {
        // Validate
        if (product.name.length < 10 || product.name.length > 20) {
            console.error("Name must be 10–20 characters.");
            return null;
        }
        if (product.price <= 0) {
            console.error("Price must be a positive number.");
            return null;
        }
        if (product.description && product.description.length > 500) {
            console.error("Description must be at most 500 characters.");
            return null;
        }
        // Generate ID if not injected
        const id = product.id ??
            (globalThis.crypto?.randomUUID
                ? globalThis.crypto.randomUUID()
                : require("crypto").randomUUID()); // fallback for Node
        const { data, error } = await db_1.supabase
            .from("products")
            .insert({
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description || null
        })
            .select()
            .maybeSingle();
        if (error || !data) {
            console.error("Error creating product:", error);
            return null;
        }
        return data;
    },
};
