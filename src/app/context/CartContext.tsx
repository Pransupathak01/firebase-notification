import React, { createContext, useState, useContext, useCallback, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import {
    fetchCart,
    addToCartAPI,
    updateCartAPI,
    clearCartAPI,
    CartData,
    CartItem,
    CartUpdateAction,
} from '../services/cartService';
import { useAuth } from './AuthContext';

// ── Types ──────────────────────────────────────────────────────

interface CartContextType {
    /** Full cart data from the API */
    cartData: CartData | null;
    /** Shortcut – list of cart items */
    cartItems: CartItem[];
    /** Whether a cart operation is in progress */
    loading: boolean;
    /** Total number of items in cart */
    totalItems: number;
    /** Total discounted price */
    totalPrice: number;
    /** Total MRP (before discount) */
    totalMrp: number;
    /** Total savings */
    totalSavings: number;
    /** Total earnings */
    totalEarnings: number;

    /** Fetch / refresh the cart from the server */
    refreshCart: () => Promise<void>;
    /** Add a product to cart (from Product Details screen) */
    addToCart: (productId: string, quantity?: number, size?: string) => Promise<boolean>;
    /** Increment quantity of a cart item */
    incrementItem: (productId: string, size?: string) => Promise<void>;
    /** Decrement quantity (removes at 0) */
    decrementItem: (productId: string, size?: string) => Promise<void>;
    /** Remove item entirely */
    removeFromCart: (productId: string) => Promise<void>;
    /** Set exact quantity */
    setItemQuantity: (productId: string, quantity: number) => Promise<void>;
    /** Change item size */
    changeItemSize: (productId: string, newSize: string) => Promise<void>;
    /** Clear entire cart */
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();
    const [cartData, setCartData] = useState<CartData | null>(null);
    const [loading, setLoading] = useState(false);

    // Derived values
    const cartItems = cartData?.items ?? [];
    const totalItems = cartData?.totalItems ?? 0;
    const totalPrice = cartData?.totalPrice ?? 0;
    const totalMrp = cartData?.totalMrp ?? 0;
    const totalSavings = cartData?.totalSavings ?? 0;
    const totalEarnings = cartData?.totalEarnings ?? 0;

    // ─── Refresh cart from server ──────────────────────────────
    const refreshCart = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await fetchCart();
            if (res.success) {
                setCartData(res.data);
            }
        } catch (err: any) {
            console.error('[CartContext] refreshCart error:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Auto-fetch cart when token becomes available
    useEffect(() => {
        if (token) {
            refreshCart();
        } else {
            setCartData(null);
        }
    }, [token, refreshCart]);

    // ─── Add to cart (POST /cart/add) ──────────────────────────
    const addToCart = useCallback(async (productId: string, quantity: number = 1, size: string = ''): Promise<boolean> => {
        try {
            setLoading(true);
            const res = await addToCartAPI(productId, quantity, size);
            if (res.success) {
                // Refresh full cart to get updated totals
                await refreshCart();
                return true;
            }
            return false;
        } catch (err: any) {
            console.error('[CartContext] addToCart error:', err);
            Alert.alert('Error', err?.message || 'Failed to add item to cart');
            return false;
        } finally {
            setLoading(false);
        }
    }, [refreshCart]);

    // ─── Increment (POST /cart/update action=increment) ────────
    const incrementItem = useCallback(async (productId: string, size?: string) => {
        try {
            setLoading(true);
            const res = await updateCartAPI(productId, 'increment', { size });
            if (res.success) {
                setCartData(res.data);
            }
        } catch (err: any) {
            console.error('[CartContext] incrementItem error:', err);
            Alert.alert('Error', err?.message || 'Failed to update cart');
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Decrement (POST /cart/update action=decrement) ────────
    const decrementItem = useCallback(async (productId: string, size?: string) => {
        try {
            setLoading(true);
            const res = await updateCartAPI(productId, 'decrement', { size });
            if (res.success) {
                setCartData(res.data);
            }
        } catch (err: any) {
            console.error('[CartContext] decrementItem error:', err);
            Alert.alert('Error', err?.message || 'Failed to update cart');
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Remove (POST /cart/update action=remove) ──────────────
    const removeFromCart = useCallback(async (productId: string) => {
        try {
            setLoading(true);
            const res = await updateCartAPI(productId, 'remove');
            if (res.success) {
                setCartData(res.data);
            }
        } catch (err: any) {
            console.error('[CartContext] removeFromCart error:', err);
            Alert.alert('Error', err?.message || 'Failed to remove item');
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Set exact quantity (POST /cart/update action=set) ─────
    const setItemQuantity = useCallback(async (productId: string, quantity: number) => {
        try {
            setLoading(true);
            const res = await updateCartAPI(productId, 'set', { quantity });
            if (res.success) {
                setCartData(res.data);
            }
        } catch (err: any) {
            console.error('[CartContext] setItemQuantity error:', err);
            Alert.alert('Error', err?.message || 'Failed to update quantity');
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Change size (POST /cart/update action=size) ───────────
    const changeItemSize = useCallback(async (productId: string, newSize: string) => {
        try {
            setLoading(true);
            const res = await updateCartAPI(productId, 'size', { size: newSize });
            if (res.success) {
                setCartData(res.data);
            }
        } catch (err: any) {
            console.error('[CartContext] changeItemSize error:', err);
            Alert.alert('Error', err?.message || 'Failed to change size');
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Clear entire cart (DELETE /cart) ───────────────────────
    const clearCart = useCallback(async () => {
        try {
            setLoading(true);
            const res = await clearCartAPI();
            if (res.success) {
                setCartData({ items: [], totalItems: 0, totalPrice: 0, totalMrp: 0, totalSavings: 0, totalEarnings: 0 });
            }
        } catch (err: any) {
            console.error('[CartContext] clearCart error:', err);
            Alert.alert('Error', err?.message || 'Failed to clear cart');
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <CartContext.Provider
            value={{
                cartData,
                cartItems,
                loading,
                totalItems,
                totalPrice,
                totalMrp,
                totalSavings,
                totalEarnings,
                refreshCart,
                addToCart,
                incrementItem,
                decrementItem,
                removeFromCart,
                setItemQuantity,
                changeItemSize,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// ── Hook ───────────────────────────────────────────────────────

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
