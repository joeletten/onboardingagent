export const CURRENCY_SYMBOLS = {
  EUR: '€', GBP: '£', CHF: 'Fr.', USD: '$',
  SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč',
}

export function getCurrSymbol(currency) {
  return CURRENCY_SYMBOLS[currency] || '€'
}
