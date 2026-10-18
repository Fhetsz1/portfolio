// reviews.js — sends the review to your Discord webhook
(function () {
  const form = document.getElementById("review-form");
  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");
  const honeypot = document.getElementById("rv-website");

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "status " + type;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("rv-name").value.trim();
    const review = document.getElementById("rv-text").value.trim();
    const ratingEl = document.querySelector('input[name="rating"]:checked');
    const rating = ratingEl ? ratingEl.value : "";

    if (!name || !review || !rating) {
      setStatus("Please fill in your name, pick a rating and write a short review.", "error");
      return;
    }

    // Honeypot: bots fill this, humans don't. Pretend it worked.
    if (honeypot && honeypot.value) {
      form.reset();
      setStatus("Thanks! Your review was sent.", "success");
      return;
    }

    const webhook = ((window.CONFIG && window.CONFIG.webhookUrl) || "").trim();
    if (!webhook || webhook.indexOf("PASTE_YOUR") === 0) {
      setStatus("Reviews aren't set up yet — add your webhook URL in config.js.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    setStatus("Sending your review…", "info");

    const payload = {
      username: "Review Bot",
      embeds: [
        {
          title: "New review — " + rating + "/5 ★",
          description: review.slice(0, 3500),
          color: 0xffffff,
          fields: [
            { name: "From", value: name.slice(0, 100), inline: true },
            { name: "Rating", value: rating + " / 5", inline: true },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("HTTP " + res.status);

      form.reset();
      setStatus("Thanks! Your review was sent. ✦", "success");
    } catch (err) {
      console.error("Review send failed:", err);
      setStatus("Something went wrong sending your review. Please try again later.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send review";
    }
  });
})();
