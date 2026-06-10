import { createRouter, publicQuery } from "../middleware";
import { getDashboardStats, getRegionStats } from "../queries/articles";

export const dashboardRouter = createRouter({
  stats: publicQuery.query(async () => {
    return getDashboardStats();
  }),

  regions: publicQuery.query(async () => {
    return getRegionStats();
  }),

  // Pre-computed dashboard metrics
  metrics: publicQuery.query(() => {
    return [
      { label: "Diseases Eliminated", value: 3, trend: [1, 2, 2, 3, 3, 3, 3] },
      { label: "Peace Treaties Signed", value: 12, trend: [5, 7, 8, 9, 10, 11, 12] },
      { label: "Tons Plastic Removed", value: 2.4, suffix: "M", trend: [1.2, 1.5, 1.8, 2.0, 2.1, 2.3, 2.4] },
      { label: "Students Enrolled", value: 450, suffix: "K", trend: [200, 250, 300, 340, 380, 410, 450] },
      { label: "Homes Solar Powered", value: 6.2, suffix: "M", trend: [4.0, 4.5, 5.0, 5.4, 5.7, 6.0, 6.2] },
      { label: "Health Workers Trained", value: 85, suffix: "K", trend: [40, 50, 60, 68, 73, 79, 85] },
    ];
  }),

  impactMap: publicQuery.query(() => {
    return [
      { name: "Rwanda", lat: -1.94, lng: 29.87, count: 8, score: 0.92 },
      { name: "Bangladesh", lat: 23.68, lng: 90.36, count: 12, score: 0.88 },
      { name: "Colombia", lat: 4.57, lng: -74.30, count: 6, score: 0.82 },
      { name: "Kenya", lat: -1.29, lng: 36.82, count: 9, score: 0.84 },
      { name: "Nigeria", lat: 9.08, lng: 8.68, count: 7, score: 0.93 },
      { name: "Nepal", lat: 28.39, lng: 84.12, count: 5, score: 0.88 },
      { name: "Brazil", lat: -14.24, lng: -51.93, count: 10, score: 0.79 },
      { name: "India", lat: 20.59, lng: 78.96, count: 14, score: 0.87 },
      { name: "USA", lat: 37.09, lng: -95.71, count: 4, score: 0.58 },
    ];
  }),
});
