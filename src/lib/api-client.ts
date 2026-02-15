export interface MetrosResponse {
  [metro: string]: string[];
}

export interface Club {
  id: number;
  name: string;
  short_name: string;
  url: string;
  status: string;
  num_holes: number;
  year_founded: number;
  address: {
    city: string;
    state: string;
    county: string;
  };
  phones: Array<{
    label: string;
    number: string;
  }>;
}

export interface SearchMeta {
  total_count: number;
  total_pages: number;
  current_page: number;
  per_page: number;
}

export interface ClubSearchResponse {
  clubs: Club[];
  meta: SearchMeta;
}

let metrosPromise: Promise<MetrosResponse> | null = null;

export function fetchMetros(baseUrl: string): Promise<MetrosResponse> {
  if (!metrosPromise) {
    metrosPromise = fetch(`${baseUrl}/api/metros.json`).then((response) => {
      if (!response.ok) throw new Error(`Failed to fetch metros: ${response.status}`);
      return response.json() as Promise<MetrosResponse>;
    });
  }
  return metrosPromise;
}

export async function searchClubs(
  baseUrl: string,
  counties: string,
  page = 1,
  perPage = 20,
): Promise<ClubSearchResponse> {
  const params = new URLSearchParams({
    counties,
    page: String(page),
    per_page: String(perPage),
  });

  const response = await fetch(`${baseUrl}/api/clubs/search.json?${params}`);
  if (!response.ok) throw new Error(`Failed to search clubs: ${response.status}`);

  return response.json();
}
