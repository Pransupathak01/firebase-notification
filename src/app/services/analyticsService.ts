import analytics from '@react-native-firebase/analytics';
import { Product } from '../hooks/useProducts';

/**
 * AnalyticsService
 * Centralized service for tracking user actions across the app.
 * Custom Event Focus: 'user_engagement'
 */
class AnalyticsService {
    private isDebug = true;

    private logDebug(event: string, params?: any) {
        if (this.isDebug) {
            console.log(`[Analytics] 🚀 Event: ${event}`, params ? `| Params: ${JSON.stringify(params)}` : '');
        }
    }

    /**
     * Unified User Engagement Logger
     */
    private async logUserEngagement(action: string, metadata: object = {}) {
        const params = {
            action: action,
            ...metadata,
            timestamp: new Date().toISOString(),
        };
        try {
            this.logDebug('user_engagement', params);
            await analytics().logEvent('user_engagement', params);
        } catch (e) {
            console.warn(`[Analytics] user_engagement:${action} failed`, e);
        }
    }

    /**
     * Authentication Engagement
     */
    async logLogin(method: string) {
        try {
            await this.logUserEngagement('login', { method });
            await analytics().logLogin({ method });
        } catch (e) { console.warn(e); }
    }

    async logSignUp(method: string) {
        try {
            await this.logUserEngagement('sign_up', { method });
            await analytics().logSignUp({ method });
        } catch (e) { console.warn(e); }
    }

    async logLogout() {
        try {
            await this.logUserEngagement('logout');
            await analytics().logEvent('logout');
        } catch (e) { console.warn(e); }
    }

    /**
     * Product & Cart Engagement
     */
    async logViewItem(product: Product) {
        const item = {
            item_id: product._id || product.id,
            item_name: product.name,
            price: product.price,
        };
        try {
            await this.logUserEngagement('view_product', item);
            await analytics().logViewItem({ items: [item], value: Number(product.price) || 0, currency: 'INR' });
        } catch (e) { console.warn(e); }
    }

    async logAddToCart(product: Product, quantity: number = 1, variant?: string) {
        const item = {
            item_id: product._id || product.id,
            item_name: product.name,
            price: product.price,
            quantity: quantity,
            variant
        };
        try {
            await this.logUserEngagement('add_to_cart', item);
            await analytics().logAddToCart({ items: [item], value: (Number(product.price) || 0) * quantity, currency: 'INR' });
        } catch (e) { console.warn(e); }
    }

    /**
     * Checkout & Purchase Engagement
     * Fixed: items passed from CartScreen are 'CartItem' objects which have a 'product' nested property.
     */
    async logBeginCheckout(totalValue: number, items: any[]) {
        // Items in cart context are usually { _id, product: { name, price }, ... }
        const productDetails = items.map(p => {
            const productInfo = p.product || p; // fallback if passed a raw product
            return `${productInfo.name || 'Unknown'}:₹${productInfo.price || 0}`;
        }).join(' | ');

        const metadata = {
            total_value: totalValue,
            items_count: items.length,
            products: productDetails
        };

        try {
            await this.logUserEngagement('checkout_started', metadata);
            await analytics().logBeginCheckout({
                value: totalValue,
                currency: 'INR',
                items: items.map(p => {
                    const productInfo = p.product || p;
                    return {
                        item_id: productInfo._id || productInfo.id,
                        item_name: productInfo.name,
                        price: productInfo.price
                    };
                })
            });
        } catch (e) { console.warn(e); }
    }

    async logCouponApplied(code: string, discount: number) {
        await this.logUserEngagement('coupon_applied', { coupon_code: code, discount_amount: discount });
    }

    async logPurchase(transactionId: string, value: number, items: any[]) {
        const productDetails = items.map(p => {
            const productInfo = p.product || p;
            return `${productInfo.name || 'Unknown'}:₹${productInfo.price || 0}`;
        }).join(' | ');

        const metadata = {
            transaction_id: transactionId,
            total_paid: value,
            products: productDetails
        };

        try {
            await this.logUserEngagement('product_purchased', metadata);
            await analytics().logPurchase({
                transaction_id: transactionId,
                value: value,
                currency: 'INR',
                items: items.map(p => {
                    const productInfo = p.product || p;
                    return {
                        item_id: productInfo._id || productInfo.id,
                        item_name: productInfo.name || 'Product',
                        price: productInfo.price || 0
                    };
                })
            });
        } catch (e) { console.warn(e); }
    }

    async logScreenView(screenName: string, screenClass: string) {
        try {
            this.logDebug('screen_view', { screenName, screenClass });
            await analytics().logScreenView({ screen_name: screenName, screen_class: screenClass });
        } catch (e) { console.warn(e); }
    }

    async logCustomEvent(eventName: string, params?: object) {
        try {
            this.logDebug(eventName, params);
            await analytics().logEvent(eventName, params);
        } catch (e) { console.warn(e); }
    }
}

export const analyticsService = new AnalyticsService();
