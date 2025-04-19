import { User } from "./modules/user.js";
import { Events } from "./modules/events.js";
import { Auth } from "./modules/auth.js";
import { Todo } from "./modules/calendar.js";

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname === "/app") {
    User.displayUserData();
  }
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", User.logout);

  const eventsBtn = document.getElementById("fetchEventsBtn");
  if (eventsBtn)
    eventsBtn.addEventListener("click", () => Events.fetchAndDisplay);

  console.log("Main app initialized.");
});
