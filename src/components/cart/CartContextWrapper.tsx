import React from "react";
import { CartProvider } from "./CartContext.jsx";

// This is a fallback provider that provides default values when the real CartProvider is not available
const CartContextWrapper = ({ children }: { children: React.ReactNode }) => {
  return <CartProvider>{children}</CartProvider>;
};

export default CartContextWrapper;
