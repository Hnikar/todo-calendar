export const DomUtils = (() => {
  function clearMessages() {
    const container = document.getElementById("messageContainer");
    if (container) container.innerHTML = "";
    document
      .querySelectorAll(".error-message, .success-message")
      .forEach((el) => {
        if (el.parentNode !== container) el.remove();
      });
  }

  function showMessage(message, type = "error") {
    clearMessages();
    const messageElement = document.createElement("div");
    messageElement.className =
      type === "error" ? "error-message" : "success-message";
    message.split("\n").forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      messageElement.appendChild(p);
    });

    const container = document.getElementById("messageContainer");
    if (container) {
      container.appendChild(messageElement);
    } else {
      const form = document.getElementById("authForm");
      form
        ? form.parentNode.insertBefore(messageElement, form)
        : document.body.prepend(messageElement);
    }
  }

  // Create a floating error message container if not present
  function showFloatingError(message, type = "error") {
    let floating = document.getElementById("floatingMessage");
    if (!floating) {
      floating = document.createElement("div");
      floating.id = "floatingMessage";
      document.body.appendChild(floating);
    }
    floating.textContent = message;
    floating.className =
      type === "success"
        ? "floating-message success"
        : "floating-message error";
    floating.style.display = "block";
    setTimeout(() => {
      floating.classList.add("fade-out");
      setTimeout(() => {
        floating.style.display = "none";
        floating.classList.remove("fade-out");
      }, 1000);
    }, 3000);
  }

  return {
    clearMessages,
    showError: (msg) => showFloatingError(msg, "error"),
    showSuccess: (msg) => showFloatingError(msg, "success"),
    showFloatingError,
  };
})();
