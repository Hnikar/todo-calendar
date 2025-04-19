describe("Loader", () => {
  beforeEach(() => {
    // Clean up the document body to ensure a clean state for each test
    document.body.innerHTML = "";
  });

  test("should create and show loader when toggle is called with true", () => {
    Loader.toggle(true);
    const loader = document.getElementById("loader");
    expect(loader).toBeTruthy();
    expect(loader.style.display).toBe("flex");
  });

  test("should hide loader when toggle is called with false", () => {
    // First, create the loader
    Loader.toggle(true);
    // Then, hide it
    Loader.toggle(false);
    const loader = document.getElementById("loader");
    expect(loader).toBeTruthy();
    expect(loader.style.display).toBe("none");
  });

  test("should not change loader state when toggle is called with true and loader already exists", () => {
    Loader.toggle(true);
    const initialDisplayState = document.getElementById("loader").style.display;
    Loader.toggle(true);
    const loader = document.getElementById("loader");
    expect(loader).toBeTruthy();
    expect(loader.style.display).toBe(initialDisplayState);
  });

  test("should not create a new loader when toggle is called with false and loader does not exist", () => {
    Loader.toggle(false);
    const loader = document.getElementById("loader");
    expect(loader).toBeNull();
  });

  test("should append loader to document body when created", () => {
    Loader.toggle(true);
    const loader = document.getElementById("loader");
    expect(loader).toBeTruthy();
    expect(loader.parentNode).toBe(document.body);
  });

  test("should have correct inner HTML structure when created", () => {
    Loader.toggle(true);
    const loader = document.getElementById("loader");
    expect(loader).toBeTruthy();
    expect(loader.innerHTML).toBe('<div class="spinner"></div>');
  });
});
