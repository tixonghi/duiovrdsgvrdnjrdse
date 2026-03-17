// Currency utility for BodyGenius AI - Simplified to USD only

/**
 * Format price with $ symbol
 */
export function formatPrice(amount: number): string {
  return `$${Math.round(amount)}`
}

/**
 * Format price with locale support
 */
export function formatPriceWithLocale(
  amount: number,
  locale: 'ru' | 'en' = 'ru'
): string {
  const formatted = locale === 'ru'
    ? amount.toLocaleString('ru-RU', { maximumFractionDigits: 0 })
    : amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return `$${formatted}`
}

/**
 * Format budget display
 */
export function formatBudget(budget: number, locale: 'ru' | 'en' = 'ru'): string {
  return formatPriceWithLocale(budget, locale)
}

/**
 * Format meal cost display
 */
export function formatMealCost(cost: number, locale: 'ru' | 'en' = 'ru'): string {
  return formatPriceWithLocale(cost, locale)
}

/**
 * Get subscription price in USD
 */
export function getSubscriptionPrice(
  tier: 'free' | 'pro' | 'elite'
): { amount: number; formatted: string } {
  const prices = {
    free: 0,
    pro: 5,
    elite: 10,
  }
  const amount = prices[tier]
  return {
    amount,
    formatted: amount === 0 ? 'Free' : `$${amount}`,
  }
}

/**
 * Get budget options for selection
 */
export function getBudgetOptions(language: 'ru' | 'en'): { value: number; label: string }[] {
  const budgets = [25, 50, 75, 100, 150]
  return budgets.map(value => ({
    value,
    label: `$${value}/${language === 'ru' ? 'нед' : 'wk'}`,
  }))
}
