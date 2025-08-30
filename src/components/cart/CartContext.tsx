import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface CartItem {
  id: string;
  listing_id: number;
  quantity: number;
  listing: {
    id: number;
    title: string;
    price: number;
    images: string[];
    condition: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  addToCart: (listingId: number, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  favorites: string[];
  addToFavorites: (listingId: number) => Promise<void>;
  removeFromFavorites: (listingId: number) => Promise<void>;
  isFavorite: (listingId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<string | null>(null);

  // Get cart count
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Initialize cart when user changes
  useEffect(() => {
    if (user) {
      fetchCart();
      fetchFavorites();
    } else {
      setCartItems([]);
      setFavorites([]);
      setCartId(null);
      setLoading(false);
    }
  }, [user]);

  // Fetch user's cart
  const fetchCart = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get or create cart
      let { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (cartError && cartError.code !== "PGRST116") {
        throw cartError;
      }

      // If no cart exists, create one
      if (!cart) {
        const { data: newCart, error: createError } = await supabase
          .from("carts")
          .insert([{ user_id: user.id }])
          .select("id")
          .single();

        if (createError) throw createError;
        cart = newCart;
      }

      if (cart) {
        setCartId(cart.id);

        // Fetch cart items with listing details
        const { data: items, error: itemsError } = await supabase
          .from("cart_items")
          .select("*, listing:listings(id, title, price, images, condition)")
          .eq("cart_id", cart.id);

        if (itemsError) throw itemsError;
        setCartItems(items || []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's favorites
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

  // Add item to cart
  const addToCart = async (listingId: number, quantity: number = 1) => {
    if (!user) {
      alert("Please log in to add items to your cart");
      return;
    }

    if (!cartId) await fetchCart();

    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(
        (item) => item.listing_id === listingId,
      );

      if (existingItem) {
        // Update quantity if item exists
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Add new item
        const { error } = await supabase.from("cart_items").insert([
          {
            cart_id: cartId,
            listing_id: listingId,
            quantity,
          },
        ]);

        if (error) throw error;
        await fetchCart(); // Refresh cart
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      setCartItems(cartItems.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity, updated_at: new Date() })
        .eq("id", itemId);

      if (error) throw error;
      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        ),
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!cartId) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId);

      if (error) throw error;
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Add to favorites
  const addToFavorites = async (listingId: number) => {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      console.log(`Adding to favorites in CartContext: ${listingId}`);
      const { data, error } = await supabase
        .from("favorites")
        .insert([
          {
            user_id: user.id,
            listing_id: listingId,
          },
        ])
        .select();

      if (error) {
        // Check if it's a unique constraint violation
        if (error.code === "23505") {
          console.log("Item already in favorites");
          // Still update local state if not already there
          if (!favorites.includes(listingId.toString())) {
            setFavorites([...favorites, listingId.toString()]);
          }
          return { success: true, data: null };
        } else {
          throw error;
        }
      }

      // Update local state immediately
      setFavorites([...favorites, listingId.toString()]);
      console.log(`Favorites after adding: ${JSON.stringify(favorites)}`);
      return { success: true, data };
    } catch (error) {
      console.error("Error adding to favorites:", error);
      return { success: false, error };
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (listingId: number) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      console.log(`Removing from favorites in CartContext: ${listingId}`);
      const { data, error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .select();

      if (error) throw error;

      // Update local state immediately
      setFavorites(favorites.filter((id) => id !== listingId.toString()));
      console.log(`Favorites after removing: ${JSON.stringify(favorites)}`);

      return { success: true, data };
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return { success: false, error };
    }
  };

  // Check if item is in favorites
  const isFavorite = (listingId: number): boolean => {
    return favorites.includes(listingId.toString());
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
