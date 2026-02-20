import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Product {
    id: string;
    name: string;
    price: number | string;
    image?: string;
    imageUrl?: string;
    images?: string[];
    mrp?: number;
    discount?: number;
    youEarn?: number;
    brand?: string;
}

interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (product: Product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalAmount = cartItems.reduce((sum, item) => {
        let price: number;
        if (typeof item.price === 'number') {
            price = item.price;
        } else {
            price = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
        }
        return sum + price * item.quantity;
    }, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
