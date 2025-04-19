import { Events } from ".../src/modules/events.js";
import { Loader } from "../src/modules/loader.js";
import fetchMock from "jest-fetch-mock";

// Enable fetch mocking
fetchMock.enableMocks();

// Mock the Loader module
jest.mock("../src/loader.js", () => ({
  toggle: jest.fn(),
}));

describe("Events", () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    fetchMock.resetMocks();
    // Clear all instances and calls to constructor and all methods:
    Loader.toggle.mockClear();

    // Set up our document body
    document.body.innerHTML = '<div id="eventsOutput"></div>';
  });

  test("fetchAndDisplay should display loading message and received events", async () => {
    // Mock fetch response
    fetchMock.mockResponseOnce(JSON.stringify([{ id: 1, name: "Event 1" }]));

    await Events.fetchAndDisplay();

    expect(document.getElementById("eventsOutput").innerHTML).toContain(
      "Received Events:"
    );
    expect(Loader.toggle).toHaveBeenCalledWith(true);
    expect(Loader.toggle).toHaveBeenCalledWith(false);
  });

  test("fetchAndDisplay should handle no events found", async () => {
    // Mock fetch response
    fetchMock.mockResponseOnce(JSON.stringify([]));

    await Events.fetchAndDisplay();

    expect(document.getElementById("eventsOutput").innerHTML).toBe(
      "No events found for your account."
    );
    expect(Loader.toggle).toHaveBeenCalledWith(true);
    expect(Loader.toggle).toHaveBeenCalledWith(false);
  });

  test("fetchAndDisplay should handle fetch error", async () => {
    // Mock fetch response to simulate network error
    fetchMock.mockRejectOnce(new Error("Network error"));

    await Events.fetchAndDisplay();

    expect(document.getElementById("eventsOutput").innerHTML).toContain(
      "Error loading events: Network error"
    );
    expect(Loader.toggle).toHaveBeenCalledWith(true);
    expect(Loader.toggle).toHaveBeenCalledWith(false);
  });

  test("fetchAndDisplay should handle non-OK HTTP response", async () => {
    // Mock fetch response with a non-OK status
    fetchMock.mockResponseOnce("Not Found", { status: 404 });

    await Events.fetchAndDisplay();

    expect(document.getElementById("eventsOutput").innerHTML).toContain(
      "Error loading events: HTTP error! Status: 404"
    );
    expect(Loader.toggle).toHaveBeenCalledWith(true);
    expect(Loader.toggle).toHaveBeenCalledWith(false);
  });
});
