export type IncomeBand = {
  rangeStart: number
  rangeEnd: number
  rate: number
  label?: string
}

export type BaseTaxCalculation = {
  taxableIncome: number
  totalTax: number
  takeHome: number
  taxBands: (IncomeBand & {
    tax: number
    incomeInBand: number
  })[]
}

export class Base {
  private readonly bands: IncomeBand[]
  public readonly income: number
  constructor(bands: IncomeBand[], income: number) {
    this.bands = bands.sort((a, b) => a.rangeStart - b.rangeStart)
    this.income = income
  }

  protected calculateIncomeTaxBase(): BaseTaxCalculation {
    let taxableIncome = 0
    let totalTax = 0
    const taxBands: (IncomeBand & { tax: number; incomeInBand: number })[] = []

    let remainingIncome = this.income

    for (const band of this.bands) {
      const bandWidth = band.rangeEnd - band.rangeStart
      const incomeInBand = Math.min(Math.max(remainingIncome, 0), bandWidth)
      const taxForBand = incomeInBand * band.rate

      taxBands.push({
        ...band,
        tax: taxForBand,
        incomeInBand,
      })

      if (band.rate > 0) {
        taxableIncome += incomeInBand
        totalTax += taxForBand
      }

      remainingIncome -= bandWidth

      if (remainingIncome <= 0) break
    }

    const takeHome = this.income - totalTax

    return {
      taxableIncome,
      totalTax,
      takeHome,
      taxBands,
    }
  }
}
