// 타로 리딩 API 호출
export async function fetchTarotReading(
  category: string,
  categoryLabel: string,
  cards: string[]
) {
  const response = await fetch("/api/tarot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, categoryLabel, cards }),
  });

  return response.json();
}
