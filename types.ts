
export interface BillConfiguration {
  ratePerUnit: number;
  vatPercentage: number;
  fixedServiceCharge: number;
}

export interface BillDetails {
  units: number;
  subtotal: number;
  vatAmount: number;
  serviceCharge: number;
  total: number;
}
