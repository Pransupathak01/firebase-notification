import { useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';

/**
 * useAnalytics Hook
 * Provides easy access to analytics tracking methods.
 */
export const useAnalytics = () => {
    return {
        login: analyticsService.logLogin.bind(analyticsService),
        signUp: analyticsService.logSignUp.bind(analyticsService),
        logout: analyticsService.logLogout.bind(analyticsService),
        viewItem: analyticsService.logViewItem.bind(analyticsService),
        addToCart: analyticsService.logAddToCart.bind(analyticsService),
        beginCheckout: analyticsService.logBeginCheckout.bind(analyticsService),
        purchase: analyticsService.logPurchase.bind(analyticsService),
        screenView: analyticsService.logScreenView.bind(analyticsService),
        couponApplied: analyticsService.logCouponApplied.bind(analyticsService),
        custom: analyticsService.logCustomEvent.bind(analyticsService),
    };
};

/**
 * useTrackScreen Hook
 * Automatically tracks a screen view on mount.
 */
export const useTrackScreen = (screenName: string, screenClass?: string) => {
  useEffect(() => {
    analyticsService.logScreenView(screenName, screenClass || screenName);
  }, [screenName, screenClass]);
};
