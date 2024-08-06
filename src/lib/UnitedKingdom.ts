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

type StudentLoanInput =
  | "planOne"
  | "planTwo"
  | "planFour"
  | "planFive"
  | "postGraduate"

const StudentLoanBands = {
  planOne: { threshold: 24990, rate: 0.09 },
  planTwo: { threshold: 27295, rate: 0.09 },
  planFour: { threshold: 31395, rate: 0.09 },
  planFive: { threshold: 25000, rate: 0.09 },
  postGraduate: { threshold: 21000, rate: 0.06 },
}

const personalAllowanceModifier = (
  bands: IncomeBand[],
  income: number,
  deductions: number
): IncomeBand[] => {
  const adjustedIncome = income - deductions
  if (adjustedIncome > 100000) {
    const incomeOver100k = adjustedIncome - 100000
    const personalAllowanceReduction = Math.min(incomeOver100k * 0.5, 12570) // Cap reduction at full personal allowance

    console.log(adjustedIncome)
    console.log(incomeOver100k)
    console.log(personalAllowanceReduction)
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
    // If adjusted income is not over 100000, return the original bands unchanged
    return bands
  }
}

export class UnitedKingdomTax extends Base {
  public readonly studentLoan: StudentLoanInput
  public readonly pension: { employee: number; employer: number }
  constructor({
    income,
    studentLoan,
    pension,
  }: {
    income: number
    studentLoan: StudentLoanInput
    pension: { employee: number; employer: number }
  }) {
    const deductions = pension.employee * income
    const modifiedBands = personalAllowanceModifier(UKBands, income, deductions)
    console.log(modifiedBands)
    super(modifiedBands, income, deductions)
    this.studentLoan = studentLoan
    this.pension = pension
  }
  public calculate() {
    const NI = this.calculateNationalInsurance()
    const studentLoan = this.calculateStudentLoan()
    const { takeHome, totalTax, taxBands, taxableIncome } =
      super.calculateIncomeTaxBase()
    return {
      income: this.income,
      taxableIncome,
      taxFreeAllowance: taxBands[0].rangeEnd,
      incomeTax: totalTax,
      totalDeductions:
        totalTax + NI + studentLoan + this.pension.employee * this.income,
      takeHome:
        takeHome - NI - studentLoan - this.pension.employee * this.income,
      nationalInsurance: NI,
      studentLoan: {
        plan: this.studentLoan,
        amount: studentLoan,
      },
      pension: {
        employee: this.pension.employee * this.income,
        employer: this.pension.employer * this.income,
      },
      taxBands,
    }
  }
  private calculateNationalInsurance(): number {
    const weeklyIncome = this.income / 52

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

  private calculateStudentLoan(): number {
    function isStudentLoanInput(value: any): value is StudentLoanInput {
      return [
        "planOne",
        "planTwo",
        "planFour",
        "planFive",
        "postGraduate",
      ].includes(value)
    }
    if (!this.studentLoan || !isStudentLoanInput(this.studentLoan)) return 0
    const bands = StudentLoanBands[this.studentLoan]
    const { threshold, rate } = bands

    const overThreshold = this.income > threshold
    const studentLoan = overThreshold ? (this.income - threshold) * rate : 0

    return studentLoan
  }
}
