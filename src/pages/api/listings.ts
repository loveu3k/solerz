import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Handle creating a new listing
    const { title, description, category, condition, price, location, filters, images } = req.body;

    const { data, error } = await supabase.from("listings").insert([
      {
        title,
        description,
        category,
        condition: parseInt(condition, 10),
        price: parseFloat(price),
        location,
        filters,
        images,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } else if (req.method === "GET") {
    // Handle fetching listings
    const { q, category, filters, page = 1 } = req.query;
    const pageSize = 10;
    const offset = (parseInt(page as string, 10) - 1) * pageSize;

    let query = supabase.from("listings").select("*").range(offset, offset + pageSize - 1);

    if (q) {
      query = query.ilike("title", `%${q}%`);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (filters) {
      const filterArray = (filters as string).split(",");
      filterArray.forEach((filter) => {
        const [key, value] = filter.split(":");
        query = query.eq(key, value);
      });
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ products: data, hasMore: data.length === pageSize });
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}