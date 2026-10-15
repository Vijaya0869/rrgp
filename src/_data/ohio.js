// Ohio outline and market positions for the Portfolio map.
// Simplified state border (lon, lat), projected equirectangular with a
// cos(40.2°) longitude correction so the shape reads true at Ohio's latitude.
const border = [
  // Michigan line, Indiana corner to Toledo
  [-84.82, 41.70], [-83.45, 41.73],
  // Lake Erie shore, west to east
  [-83.10, 41.62], [-82.94, 41.51], [-82.71, 41.45], [-82.55, 41.40], [-82.18, 41.47],
  [-81.69, 41.50], [-81.45, 41.66], [-81.28, 41.76], [-80.79, 41.90], [-80.52, 41.98],
  // Pennsylvania line south to the Ohio River
  [-80.52, 40.64],
  // Ohio River, upstream to downstream
  [-80.63, 40.37], [-80.73, 40.06], [-80.87, 39.77], [-81.22, 39.55], [-81.45, 39.41],
  [-81.56, 39.27], [-81.75, 39.07], [-82.03, 38.99], [-82.20, 38.81], [-82.30, 38.57],
  [-82.45, 38.42], [-82.68, 38.53], [-83.00, 38.73], [-83.30, 38.62], [-83.60, 38.69],
  [-83.84, 38.74], [-84.05, 38.77], [-84.28, 39.00], [-84.51, 39.09], [-84.82, 39.10],
  // Indiana line back north
];

const W = 400;
const K = Math.cos((40.2 * Math.PI) / 180);
const lon0 = -84.82, lon1 = -80.52, lat0 = 38.40, lat1 = 41.98;
const scale = W / ((lon1 - lon0) * K);
const H = Math.round((lat1 - lat0) * scale);
const xy = (lon, lat) => [
  +(((lon - lon0) * K) * scale).toFixed(1),
  +((lat1 - lat) * scale).toFixed(1),
];

// Market names as typed in the CMS (case-insensitive). A market without an
// entry here still appears in the list beside the map, just without a dot.
const places = {
  "columbus": [-83.00, 39.96],
  "gahanna": [-82.88, 40.02],
  "worthington": [-83.02, 40.09],
  "delaware": [-83.07, 40.30],
  "marysville / union county": [-83.37, 40.24],
  "marysville": [-83.37, 40.24],
  "union county": [-83.37, 40.24],
  "dayton": [-84.19, 39.76],
  "cincinnati": [-84.51, 39.10],
  "northeast ohio": [-81.60, 41.30],
  "cleveland": [-81.69, 41.50],
  "akron": [-81.52, 41.08],
  "toledo": [-83.55, 41.65],
  "dublin": [-83.11, 40.10],
  "westerville": [-82.93, 40.13],
  "hilliard": [-83.16, 40.03],
  "grove city": [-83.09, 39.88],
  "newark": [-82.40, 40.06],
  "lancaster": [-82.60, 39.71],
  "springfield": [-83.81, 39.92],
};

export default {
  width: W,
  height: H,
  path: "M" + border.map(([a, b]) => xy(a, b).join(",")).join("L") + "Z",
  dot(name) {
    const p = places[String(name || "").trim().toLowerCase()];
    return p ? xy(p[0], p[1]) : null;
  },
};
