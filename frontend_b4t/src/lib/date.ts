export const MONTH_OPTIONS = [
  { label: "Jan", value: "1" },
  { label: "Feb", value: "2" },
  { label: "Mar", value: "3" },
  { label: "Apr", value: "4" },
  { label: "May", value: "5" },
  { label: "Jun", value: "6" },
  { label: "Jul", value: "7" },
  { label: "Aug", value: "8" },
  { label: "Sep", value: "9" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dec", value: "12" },
]

export const getYearOptions = (
  startYear = 2020,
  futureYears = 2
) => {
  const currentYear = new Date().getFullYear()
  const years: string[] = []

  for (let y = currentYear + futureYears; y >= startYear; y--) {
    years.push(String(y))
  }

  return years
}
