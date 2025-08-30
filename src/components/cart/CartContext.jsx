// src/components/cart/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../lib/supabase"; // Adjusted path from src/components/cart/
import { useAuth } from "../../contexts/AuthContext"; // Adjusted path from src/components/cart/

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const auth = useAuth() || { user: null };
  const { user } = auth;
  const [cart, setCart] = useState([]); // Cart items
  const [favorites, setFavorites] = useState([]); // Favorites
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites().then(() => setLoading(false));
      // Optionally fetch cart here if stored in Supabase
    } else {
      setFavorites([]);
      setCart([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites(data?.map((item) => item.listing_id.toString()) || []);
      return data;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return [];
    }
  };

  const addToCart = async (listingId) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      // Optional: Persist to Supabase if you have a "cart" table
      // For now, just update local state
      setCart((prev) => [...prev, listingId.toString()]);
      return { success: true };
    } catch (error) {
      console.error("Error adding to cart:", error);
      return { success: false, error };
    }
  };

  const addToFavorites = async (listingId) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("favorites")
        .insert([{ user_id: user.id, listing_id: listingId }])
        .select();

      if (error && error.code !== "23505") throw error; // 23505 = duplicate entry
      setFavorites((prev) => [...prev, listingId.toString()]);
      return { success: true, data };
    } catch (error) {
      console.error("Error adding to favorites:", error);
      return { success: false, error };
    }
  };

  const removeFromFavorites = async (listingId) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .select();

      if (error) throw error;
      setFavorites((prev) => prev.filter((id) => id !== listingId.toString()));
      return { success: true, data };
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return { success: false, error };
    }
  };

  const isFavorite = (listingId) => {
    return favorites.includes(listingId.toString());
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        favorites,
        loading,
        addToCart,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        fetchFavorites,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
