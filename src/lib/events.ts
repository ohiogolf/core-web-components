export interface ClubSearchDetail {
  counties: string;
  label: string;
}

export interface CountySelectedDetail {
  county: string;
  regionId: string;
  regionName: string;
}

export interface ClubDetail {
  clubId: number;
  clubName: string;
}

export function dispatchClubSearch(
  target: EventTarget,
  detail: ClubSearchDetail | null,
) {
  target.dispatchEvent(
    new CustomEvent<ClubSearchDetail | null>("club-search", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

export function dispatchCountySelected(
  target: EventTarget,
  detail: CountySelectedDetail,
) {
  target.dispatchEvent(
    new CustomEvent<CountySelectedDetail>("county-selected", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

export function dispatchClubDetail(
  target: EventTarget,
  detail: ClubDetail,
) {
  target.dispatchEvent(
    new CustomEvent<ClubDetail>("club-detail", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}
