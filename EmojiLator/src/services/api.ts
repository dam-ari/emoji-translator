export async function fetchEmojis(): Promise<Record<string, string>> {
  const response = await fetch("https://logrus-bar.npkn.net/emojis/");
  if (!response.ok) {
    throw new Error("Failed to fetch emojis");
  }
  return response.json();
}
