/**
 * Multi-step form — edit `steps` to add your copy and questions.
 */
(function initForm() {
  const steps = [
    {
      // Step 0: blank intro — fill in later
      title: "HIIIIII <3",
      body: "<p>KAYLA!!!!! wow look at this super awesome amazing cool website that was made for you because of how special and awesome you are!!</p> <br/> <img src='https://media.tenor.com/nYepJTU5oPAAAAAM/stan-twt-funny.gif'/>",
    },
    {
      title: "ooooooo",
      body: "<p>I really like you a lottt, long distance will be hard but I think with you it really can work :'), and to me there's no doubt that you're worth the effort and hardships !! sooooooo will YOU be my girlfriend???</p> <br/> <img src='https://media.tenor.com/yAKJsNu5Si4AAAAM/cats-kittens.gif'/>",
      yesNo: true,
    },
    {
      title: "YAAAAAAYYYYYYYY!!!!!! <br/> ( mmmmmmmmm )",
      body: "<p>You fell for the nerd, nerd!!!!!! Normal people dont do things like this so you're now dealing with the consequences ;') <br/> <img src='https://media.tenor.com/Dtbh5RBNNvUAAAAM/happy-catto-cats.gif'/> <br/> sooooo dinner to celebrate????</p>",
      yesNo: true,
    },
    {
      title: "What u feeeeeellin",
      body: "<p>Pick what sounds good for celebration dinner!!</p>",
      foodPicker: [
        { emoji: "🍕", label: "Pizza" },
        { emoji: "🍣", label: "Sushi" },
        { emoji: "🍔", label: "Burgers" },
        { emoji: "🌮", label: "Tacos" },
        { emoji: "🍝", label: "Pasta" },
        { emoji: "🍛", label: "Curry" },
        { emoji: "🍜", label: "Ramen" },
        { emoji: "🥩", label: "Steak" },
        { emoji: "🍗", label: "Fried chicken" },
        { emoji: "🥟", label: "Dumplings" },
        { emoji: "🦞", label: "Seafood" },
        { emoji: "🍖", label: "BBQ" },
        { emoji: "🥗", label: "Salad" },
        { emoji: "🌯", label: "Burritos" },
        { emoji: "🍱", label: "Bento" },
        { emoji: "🧇", label: "Brunch" },
      ],
    },
    {
      title: "It's a date!! <3",
      body: "",
      finale: true,
    },
  ];

  const form = document.getElementById("ask-form");
  const stepsContainer = document.getElementById("form-steps");
  const progressFill = document.getElementById("progress-fill");
  const progressBar = document.querySelector(".card__progress");
  const btnBack = document.getElementById("btn-back");
  const btnNext = document.getElementById("btn-next");

  let currentStep = 0;
  let selectedFood = null;
  let selectedFoodEmoji = null;
  let teardownRunaway = null;
  let resizeObserver = null;

  const NO_EASE = 0.14;
  const STEP_HEIGHT_MS = 450;

  function renderSteps() {
    stepsContainer.innerHTML = steps
      .map(
        (step, i) => `
        <section
          class="step${i === 0 ? " step--active" : ""}${step.foodPicker ? " step--food" : ""}${step.finale ? " step--finale" : ""}"
          data-step="${i}"
          aria-hidden="${i !== 0}"
        >
          ${step.title ? `<h2 class="step__title">${step.title}</h2>` : ""}
          <div class="step__body">${step.body || ""}</div>
          ${
            step.yesNo
              ? `
          <div class="step__choices">
            <button type="button" class="btn btn--primary btn--yes" data-yes>Yes!</button>
            <div class="step__choices-playground" data-playground>
              <button type="button" class="btn btn--ghost btn--no" data-no>No</button>
            </div>
          </div>`
              : ""
          }
          ${
            step.foodPicker
              ? `
          <div class="food-grid" role="radiogroup" aria-label="Dinner options">
            ${step.foodPicker
              .map(
                (food) => `
            <button
              type="button"
              class="food-option"
              data-food-option
              data-food="${food.label}"
              data-emoji="${food.emoji}"
              aria-pressed="false"
            >
              <span class="food-option__emoji" aria-hidden="true">${food.emoji}</span>
              <span class="food-option__label">${food.label}</span>
            </button>`
              )
              .join("")}
          </div>`
              : ""
          }
        </section>
      `
      )
      .join("");

    stepsContainer.querySelectorAll("[data-yes]").forEach((btn) => {
      btn.addEventListener("click", () => goToStep(currentStep + 1));
    });

    stepsContainer.querySelectorAll("[data-food-option]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const step = btn.closest(".step");
        step.querySelectorAll("[data-food-option]").forEach((option) => {
          option.classList.remove("food-option--selected");
          option.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("food-option--selected");
        btn.setAttribute("aria-pressed", "true");
        selectedFood = btn.dataset.food;
        selectedFoodEmoji = btn.dataset.emoji;
        btnNext.disabled = false;
        updateUI();
      });
    });
  }

  function syncStepsHeight() {
    const active = stepsContainer.querySelector(".step--active");
    if (!active) return;

    const height = active.scrollHeight;
    stepsContainer.style.height = `${height}px`;
  }

  function watchStepContent(stepEl) {
    if (resizeObserver) resizeObserver.disconnect();

    resizeObserver = new ResizeObserver(() => syncStepsHeight());
    resizeObserver.observe(stepEl);

    stepEl.querySelectorAll("img").forEach((img) => {
      if (img.complete) return;
      img.addEventListener("load", syncStepsHeight, { once: true });
    });
  }

  function computeFleeTarget(playground, noBtn, clientX, clientY, posX, posY) {
    const threshold = 110;
    const pRect = playground.getBoundingClientRect();
    const maxX = Math.max(0, pRect.width - noBtn.offsetWidth);
    const maxY = Math.max(0, pRect.height - noBtn.offsetHeight);
    const btnCx = pRect.left + posX + noBtn.offsetWidth / 2;
    const btnCy = pRect.top + posY + noBtn.offsetHeight / 2;
    const dist = Math.hypot(clientX - btnCx, clientY - btnCy);

    if (dist > threshold) return null;

    for (let attempt = 0; attempt < 24; attempt++) {
      const newX = Math.random() * maxX;
      const newY = Math.random() * maxY;
      const newCx = pRect.left + newX + noBtn.offsetWidth / 2;
      const newCy = pRect.top + newY + noBtn.offsetHeight / 2;
      const newDist = Math.hypot(clientX - newCx, clientY - newCy);

      if (newDist > threshold + 50) {
        return { x: newX, y: newY };
      }
    }

    const awayX = btnCx - clientX;
    const awayY = btnCy - clientY;
    const len = Math.hypot(awayX, awayY) || 1;
    return {
      x: Math.min(maxX, Math.max(0, posX + (awayX / len) * 90)),
      y: Math.min(maxY, Math.max(0, posY + (awayY / len) * 90)),
    };
  }

  function initRunawayNo() {
    if (teardownRunaway) {
      teardownRunaway();
      teardownRunaway = null;
    }

    const step = stepsContainer.querySelector(
      `.step[data-step="${currentStep}"]`
    );
    if (!step) return;

    const playground = step.querySelector("[data-playground]");
    const noBtn = step.querySelector("[data-no]");
    if (!playground || !noBtn) return;

    let posX = Math.max(0, (playground.offsetWidth - noBtn.offsetWidth) / 2);
    let posY = 0;
    let targetX = posX;
    let targetY = posY;
    let rafId = null;

    const applyTransform = () => {
      noBtn.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
    };

    const tick = () => {
      const dx = targetX - posX;
      const dy = targetY - posY;

      posX += dx * NO_EASE;
      posY += dy * NO_EASE;
      applyTransform();

      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
        rafId = requestAnimationFrame(tick);
      } else {
        posX = targetX;
        posY = targetY;
        applyTransform();
        rafId = null;
      }
    };

    const setTarget = (x, y) => {
      targetX = x;
      targetY = y;
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const fleeFromCursor = (clientX, clientY) => {
      const next = computeFleeTarget(
        playground,
        noBtn,
        clientX,
        clientY,
        posX,
        posY
      );
      if (next) setTarget(next.x, next.y);
    };

    applyTransform();

    const onMove = (e) => {
      const point = "touches" in e ? e.touches[0] : e;
      if (!point) return;
      fleeFromCursor(point.clientX, point.clientY);
    };

    const onNoEnter = (e) => {
      fleeFromCursor(e.clientX, e.clientY);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove, { passive: true });
    noBtn.addEventListener("mouseenter", onNoEnter);
    noBtn.addEventListener("touchstart", onMove, { passive: true });
    noBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      fleeFromCursor(e.clientX, e.clientY);
    });
    noBtn.addEventListener("click", (e) => e.preventDefault());

    teardownRunaway = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("touchmove", onMove);
      noBtn.removeEventListener("mouseenter", onNoEnter);
      noBtn.removeEventListener("touchstart", onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }

  function updateUI() {
    const panels = stepsContainer.querySelectorAll(".step");
    panels.forEach((panel, i) => {
      const active = i === currentStep;
      panel.classList.toggle("step--active", active);
      panel.setAttribute("aria-hidden", String(!active));
    });

    const progress =
      steps.length <= 1 ? 100 : (currentStep / (steps.length - 1)) * 100;
    progressFill.style.width = `${progress}%`;
    progressBar.setAttribute("aria-valuenow", String(Math.round(progress)));

    const stepConfig = steps[currentStep];
    const isYesNoStep = stepConfig?.yesNo;
    const isFoodStep = Boolean(stepConfig?.foodPicker);
    const isFinale = Boolean(stepConfig?.finale);
    const cardNav = form.querySelector(".card__nav");

    form.classList.toggle("card--wide", isFoodStep);
    cardNav.hidden = isFinale;

    btnBack.hidden = currentStep === 0 || isFinale;
    btnNext.hidden = isYesNoStep || isFinale;
    btnNext.textContent = isFoodStep ? "Finish" : "Next";
    btnNext.disabled = isFoodStep && !selectedFood;

    const finaleBody = stepsContainer.querySelector(
      ".step--finale .step__body"
    );
    if (finaleBody && selectedFood) {
      finaleBody.innerHTML = `<p>${selectedFoodEmoji} <strong>${selectedFood}</strong> sounds perfect mwaaahhhh <br/> <img src="https://i.pinimg.com/originals/5a/cd/71/5acd718308f3d8212a9279d094ae8ea2.gif"/> </p>`;
    }

    const activePanel = stepsContainer.querySelector(".step--active");
    if (activePanel) {
      watchStepContent(activePanel);
      syncStepsHeight();
      requestAnimationFrame(syncStepsHeight);
      setTimeout(syncStepsHeight, STEP_HEIGHT_MS);
    }

    if (isYesNoStep) {
      initRunawayNo();
    } else if (teardownRunaway) {
      teardownRunaway();
      teardownRunaway = null;
    }
  }

  function goToStep(index) {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    updateUI();
  }

  window.addEventListener("resize", syncStepsHeight);

  btnBack.addEventListener("click", () => goToStep(currentStep - 1));

  btnNext.addEventListener("click", () => {
    if (steps[currentStep]?.finale) return;

    const isFoodStep = Boolean(steps[currentStep]?.foodPicker);
    if (isFoodStep && !selectedFood) return;

    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    }
  });

  renderSteps();
  updateUI();
  requestAnimationFrame(syncStepsHeight);
})();
