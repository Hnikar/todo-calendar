import { User } from "./modules/user.js";
import { Auth } from "./modules/auth.js";
import { Todo } from "./modules/calendar.js";

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname === "/app") {
    User.displayUserData();
  }
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", User.logout);

  console.log("Main app initialized.");
});
