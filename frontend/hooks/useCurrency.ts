import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency, formatCurrencyCompact, parseCurrency, CURRENCY_SYMBOLS } from '../utils/currencyFormatter';
import type { Currency } from '../types';

/**
 * Custom hook for currency formatting
 * Automatically uses the currency from ThemeContext
 */
export const useCurrency = () => {
    const { currency } = useTheme();

    return {
        currency,
        symbol: CURRENCY_SYMBOLS[currency],
        format: (amount: number | string | null | undefined, options?: {
            minimumFractionDigits?: number;
            maximumFractionDigits?: number;
            showSymbol?: boolean;
            locale?: string;
        }) => formatCurrency(amount, currency, options),
        formatCompact: (amount: number | string | null | undefined, options?: {
            minimumFractionDigits?: number;
            maximumFractionDigits?: number;
        }) => formatCurrencyCompact(amount, currency, options),
        parse: (value: string) => parseCurrency(value, currency),
    };
};

