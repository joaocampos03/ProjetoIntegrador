export type SavedRoute = {
  id: string;
  airportCodes: string[];
  totalPrice: number;
  createdAt: string;
};

const STORAGE_KEY = "facilitavoos_saved_routes";

export const saveRoute = (
  airportCodes: string[],
  totalPrice: number
): SavedRoute => {
  const routes = getSavedRoutes();
  const newRoute: SavedRoute = {
    id: Date.now().toString(),
    airportCodes,
    totalPrice,
    createdAt: new Date().toISOString(),
  };
  routes.push(newRoute);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
  return newRoute;
};

export const getSavedRoutes = (): SavedRoute[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const deleteRoute = (id: string): void => {
  const routes = getSavedRoutes();
  const filtered = routes.filter((route) => route.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearAllRoutes = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
