// Utility functions for formatting data

/**
 * Format currency amount with appropriate suffix (B, M, K)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
    if (amount >= 1000000000) {
        return '₱' + (amount / 1000000000).toFixed(1) + 'B';
    } else if (amount >= 1000000) {
        return '₱' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return '₱' + (amount / 1000).toFixed(1) + 'K';
    }
    return '₱' + amount.toLocaleString();
}

