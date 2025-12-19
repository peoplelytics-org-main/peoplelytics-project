import type { Currency } from '../types';

/**
 * Currency symbols mapping
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
    PKR: '₨',
    USD: '$',
    EUR: '€',
    GBP: '£',
};

/**
 * Currency names mapping
 */
export const CURRENCY_NAMES: Record<Currency, string> = {
    PKR: 'Pakistani Rupee',
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
};

/**
 * Format a number as currency based on the selected currency
 * @param amount - The amount to format
 * @param currency - The currency to use (defaults to PKR if not provided)
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
    amount: number | string | null | undefined,
    currency: Currency = 'PKR',
    options: {
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
        showSymbol?: boolean;
        locale?: string;
    } = {}
): string => {
    if (amount === null || amount === undefined || amount === '') {
        return `${CURRENCY_SYMBOLS[currency]}0.00`;
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount) || !isFinite(numAmount)) {
        return `${CURRENCY_SYMBOLS[currency]}0.00`;
    }

    const {
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
        showSymbol = true,
        locale = 'en-US',
    } = options;

    const formatted = numAmount.toLocaleString(locale, {
        minimumFractionDigits,
        maximumFractionDigits,
    });

    const symbol = showSymbol ? CURRENCY_SYMBOLS[currency] : '';

    // Format based on currency position preference
    // For USD, EUR, GBP: symbol before amount
    // For PKR: symbol before amount (₨)
    return `${symbol}${formatted}`;
};

/**
 * Format currency with compact notation (e.g., $1.2K, $1.5M)
 */
export const formatCurrencyCompact = (
    amount: number | string | null | undefined,
    currency: Currency = 'PKR',
    options: {
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
    } = {}
): string => {
    if (amount === null || amount === undefined || amount === '') {
        return `${CURRENCY_SYMBOLS[currency]}0`;
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount) || !isFinite(numAmount)) {
        return `${CURRENCY_SYMBOLS[currency]}0`;
    }

    const {
        minimumFractionDigits = 1,
        maximumFractionDigits = 1,
    } = options;

    const absAmount = Math.abs(numAmount);
    const sign = numAmount < 0 ? '-' : '';

    let formatted: string;
    if (absAmount >= 1_000_000_000) {
        formatted = (absAmount / 1_000_000_000).toLocaleString('en-US', {
            minimumFractionDigits,
            maximumFractionDigits,
        }) + 'B';
    } else if (absAmount >= 1_000_000) {
        formatted = (absAmount / 1_000_000).toLocaleString('en-US', {
            minimumFractionDigits,
            maximumFractionDigits,
        }) + 'M';
    } else if (absAmount >= 1_000) {
        formatted = (absAmount / 1_000).toLocaleString('en-US', {
            minimumFractionDigits,
            maximumFractionDigits,
        }) + 'K';
    } else {
        formatted = absAmount.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    return `${sign}${CURRENCY_SYMBOLS[currency]}${formatted}`;
};

/**
 * Parse a currency string to a number
 */
export const parseCurrency = (value: string, currency: Currency = 'PKR'): number => {
    if (!value) return 0;
    
    // Remove currency symbol and any non-numeric characters except decimal point and minus
    const symbol = CURRENCY_SYMBOLS[currency];
    const cleaned = value
        .replace(symbol, '')
        .replace(/[^\d.-]/g, '')
        .trim();
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

