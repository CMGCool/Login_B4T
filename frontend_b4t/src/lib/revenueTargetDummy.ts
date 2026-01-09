export type RevenueTarget = {
  id: number | string;
  month: string;
  target: number;
  year: string;
};

export const DUMMY_REVENUE_TARGETS: RevenueTarget[] = [
  { id: 1, month: "January", target: 15000000, year: "2025" },
  { id: 2, month: "February", target: 22500000, year: "2025" },
  { id: 3, month: "March", target: 32000000, year: "2025" },
  { id: 4, month: "April", target: 42500000, year: "2025" },
  { id: 5, month: "May", target: 52000000, year: "2025" },
  { id: 6, month: "June", target: 62000000, year: "2025" },
  { id: 7, month: "July", target: 72000000, year: "2025" },
  { id: 8, month: "August", target: 82000000, year: "2025" },
  { id: 9, month: "September", target: 92000000, year: "2025" },
  { id: 10, month: "October", target: 102000000, year: "2025" },
  { id: 11, month: "November", target: 112000000, year: "2025" },
  { id: 12, month: "December", target: 122000000, year: "2025" },
];
