import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

interface WishlistContextType {
    wishlistItems: string[]; // Array of product IDs
    toggleWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const { user } = useAuth();

    // Fetch wishlist when user logs in
    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlistItems([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from("wishlist")
            .select("product_id")
            .eq("user_id", user.id);

        if (!error && data) {
            setWishlistItems(data.map(item => item.product_id));
        }
    };

    const toggleWishlist = async (productId: string) => {
        if (!user) {
            toast.error("Please sign in to add items to your wishlist");
            return;
        }

        const isCurrentlyInWishlist = wishlistItems.includes(productId);

        if (isCurrentlyInWishlist) {
            // Remove from wishlist
            const { error } = await supabase
                .from("wishlist")
                .delete()
                .eq("user_id", user.id)
                .eq("product_id", productId);

            if (!error) {
                setWishlistItems(prev => prev.filter(id => id !== productId));
                toast.success("Removed from wishlist");
            }
        } else {
            // Add to wishlist
            const { error } = await supabase
                .from("wishlist")
                .insert({
                    user_id: user.id,
                    product_id: productId
                });

            if (!error) {
                setWishlistItems(prev => [...prev, productId]);
                toast.success("Added to wishlist!");
            }
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlistItems.includes(productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}
