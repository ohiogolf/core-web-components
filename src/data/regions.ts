export interface Region {
  id: string;
  name: string;
  color: string;
  metros: string[];
  url: string;
}

export const REGIONS: Region[] = [
  { id: "noga", name: "Northern Ohio Golf Association", color: "#003366", metros: ["cleveland", "toledo"], url: "https://getahandicap.usga.org/" },
  { id: "oga", name: "Ohio Golf Association", color: "#339933", metros: ["columbus"], url: "https://join.ghin.com/bycnd6" },
  { id: "gcga", name: "Greater Cincinnati Golf Assoc.", color: "#CC3333", metros: ["cincinnati"], url: "https://www.gcga.org/start/select/" },
  { id: "mvg", name: "Miami Valley Golf", color: "#6699CC", metros: ["dayton"], url: "https://www.miamivalleygolf.org/membership/join-or-renew-7553.html" },
];
