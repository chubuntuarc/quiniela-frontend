const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchMatches() {
  const url = `${API_BASE_URL}/api/matches`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${API_SECRET}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching standings data:", error);
    throw error;
  }
}
