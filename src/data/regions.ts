export interface Region {
  id: string;
  name: string;
  color: string;
  metros: string[];
}

export const REGIONS: Region[] = [
  { id: "noga", name: "Northern Ohio Golf Association", color: "#003366", metros: ["cleveland", "toledo"] },
  { id: "oga", name: "Ohio Golf Association", color: "#339933", metros: ["columbus"] },
  { id: "gcga", name: "Greater Cincinnati Golf Assoc.", color: "#CC3333", metros: ["cincinnati"] },
  { id: "mvg", name: "Miami Valley Golf", color: "#6699CC", metros: ["dayton"] },
];
