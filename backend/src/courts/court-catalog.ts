export interface Court {
  id: string;
  name: string;
}

export const courts: readonly Court[] = [
  { id: 'laureles', name: 'Cancha Laureles' },
  { id: 'el-poblado', name: 'Cancha El Poblado' },
  { id: 'belen', name: 'Cancha Belen' },
  { id: 'robledo', name: 'Cancha Robledo' },
  { id: 'envigado', name: 'Cancha Envigado' },
];

export function findCourt(courtId: string): Court | undefined {
  return courts.find((court) => court.id === courtId);
}
