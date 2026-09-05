// Recherche de produits via l'API publique OpenFoodFacts.
// Doc : https://wiki.openfoodfacts.org/API
export async function searchFood(query) {
  if (!query.trim()) return [];

  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    query
  )}&search_simple=1&action=process&json=1&page_size=10&fields=code,product_name,brands,nutriments`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  return (data.products || [])
    .filter((p) => p.product_name && p.nutriments && p.nutriments["energy-kcal_100g"])
    .map((p) => ({
      code: p.code,
      name: p.product_name,
      brand: p.brands || "",
      kcalPer100g: Math.round(p.nutriments["energy-kcal_100g"]),
    }));
}
