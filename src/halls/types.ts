export interface BoothRecord {
  targi: string;
  hall: string;
  orderNumber: string;
  boothNumber: string;
  exhibitorName: string;
  generalStatus: string;
  detailedStatus: string;
  nip: string;
  contactPerson: string;
  contactEmail: string;
}

export interface HallDefinition {
  /** Stable identifier derived from event and hall names */
  id: string;
  eventId: string;
  eventName?: string;
  hallName: string;
  boothsWorksheet: string;
  createdAt: string;
  updatedAt: string;
}

export interface HallsIndexFile {
  version: number;
  updatedAt: string;
  halls: HallDefinition[];
}
