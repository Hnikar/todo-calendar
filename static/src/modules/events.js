import { Loader } from "./loader.js";

export const Events = (() => {
  async function fetchAndDisplay() {
    const outputDiv = document.getElementById("eventsOutput");
    if (!outputDiv) return;

    outputDiv.innerHTML = "Loading events...";
    Loader.toggle(true);

    try {
      const response = await fetch("/api/events", {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const events = await response.json();
      outputDiv.innerHTML = events.length
        ? "<h4>Received Events:</h4><pre>" +
          JSON.stringify(events, null, 2) +
          "</pre>"
        : "No events found for your account.";
    } catch (error) {
      console.error("Error fetching events:", error);
      outputDiv.innerHTML = `<p class="api-error-message">Error loading events: ${error.message}</p>`;
    } finally {
      Loader.toggle(false);
    }
  }

  return { fetchAndDisplay };
})();
