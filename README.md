# Global Tax Tool

A typescript library for calculating tax globally.

This is a modular tool and the intention is to expand this across tax jurisdictions. For now, it only supports the United Kingdom. Feel free to add others with a pull request.

## How to use

```ts
const calculator = new UnitedKingdomTax(100000) // 100,000 GBP annual income
const tax = calculator.calculate()
console.log(tax)
```

will print the following to the console:

```ts
{
  income: 100000,
  taxableIncome: 87430,
  incomeTax: 27432.2,
  totalDeductions: 31443.56,
  takeHome: 68556.44,
  nationalInsurance: 4011.3599999999997,
  taxBands: [
    {
      label: "Tax-Free Allowance",
      rangeStart: 0,
      rangeEnd: 12570,
      rate: 0,
      tax: 0,
      incomeInBand: 12570,
    }, {
      label: "Basic Rate",
      rangeStart: 12571,
      rangeEnd: 50270,
      rate: 0.2,
      tax: 7539.8,
      incomeInBand: 37699,
    }, {
      label: "Higher Rate",
      rangeStart: 50271,
      rangeEnd: 125140,
      rate: 0.4,
      tax: 19892.4,
      incomeInBand: 49731,
    }
  ],
}
```
