import { User } from "./modules/user.js";
import { Events } from "./modules/events.js";
import { Auth } from "./modules/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  User.displayUserData();
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", User.logout);

  const eventsBtn = document.getElementById("fetchEventsBtn");
  if (eventsBtn)
    eventsBtn.addEventListener("click", () => {
      e.preventDefault();
      Events.fetchAndDisplay;
    });

  console.log("Main app initialized.");
});
