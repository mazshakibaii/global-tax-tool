import { Base, type BaseTaxCalculation, type IncomeBand } from "./Base"

const UKBands: IncomeBand[] = [
  {
    label: "Tax-Free Allowance",
    rangeStart: 0,
    rangeEnd: 12570,
    rate: 0,
  },
  {
    label: "Basic Rate",
    rangeStart: 12571,
    rangeEnd: 50270,
    rate: 0.2,
  },
  {
    label: "Higher Rate",
    rangeStart: 50271,
    rangeEnd: 125140,
    rate: 0.4,
  },
  {
    label: "Additional Rate",
    rangeStart: 125141,
    rangeEnd: 999999999,
    rate: 0.45,
  },
]

const NIBands: IncomeBand[] = [
  {
    label: "0% NI Rate",
    rangeStart: 0,
    rangeEnd: 241,
    rate: 0,
  },
  {
    label: "8% NI Rate",
    rangeStart: 242,
    rangeEnd: 967,
    rate: 0.08,
  },
  {
    label: "2% NI Rate",
    rangeStart: 968,
    rangeEnd: 9999999,
    rate: 0.02,
  },
]

const personalAllowanceModifier = (
  bands: IncomeBand[],
  income: number
): IncomeBand[] => {
  if (income > 100000) {
    const incomeOver100k = income - 100000
    const personalAllowanceReduction = Math.min(incomeOver100k * 0.5, 12570) // Cap reduction at full personal allowance

    return bands.map((band, index) => {
      if (index === 0) {
        return {
          ...band,
          rangeEnd: Math.max(band.rangeEnd - personalAllowanceReduction, 0),
        }
      } else if (index === 1) {
        return {
          ...band,
          rangeStart: Math.max(band.rangeStart - personalAllowanceReduction, 0),
          rangeEnd: Math.max(band.rangeEnd - personalAllowanceReduction, 0),
        }
      } else if (index === 2) {
        return {
          ...band,
          rangeStart: Math.max(band.rangeStart - personalAllowanceReduction, 0),
        }
      } else {
        return band
      }
    })
  } else {
    // If income is not over 100000, return the original bands unchanged
    return bands
  }
}

export class UnitedKingdomTax extends Base {
  constructor(income: number) {
    const modifiedBands = personalAllowanceModifier(UKBands, income)
    super(modifiedBands, income)
  }
  public calculate() {
    const NI = this.calculateNationalInsurance()
    const { takeHome, totalTax, taxBands, taxableIncome } =
      super.calculateIncomeTaxBase()
    return {
      income: this.income,
      taxableIncome,
      incomeTax: totalTax,
      totalDeductions: totalTax + NI,
      takeHome: takeHome - NI,
      nationalInsurance: NI,
      taxBands,
    }
  }
  private calculateNationalInsurance(): number {
    const weeklyIncome = this.income / 52

    // Instead of creating a new Base instance, we'll implement the NI calculation directly
    let totalNI = 0
    let remainingIncome = weeklyIncome

    for (const band of NIBands) {
      const bandWidth = band.rangeEnd - band.rangeStart
      const incomeInBand = Math.min(Math.max(remainingIncome, 0), bandWidth)
      const niForBand = incomeInBand * band.rate

      totalNI += niForBand
      remainingIncome -= bandWidth

      if (remainingIncome <= 0) break
    }

    // Convert weekly NI to yearly
    return totalNI * 52
  }
}
