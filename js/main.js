document.addEventListener("DOMContentLoaded", () => {
  const uiToggleButton = document.getElementById("uiBtn");
  const cliToggleButton = document.getElementById("cliBtn");
  const themeToggleButton = document.getElementById("themeBtn");
  const uiMode = document.getElementById("uiMode");
  const cliMode = document.getElementById("cliMode");
  const formToggleButton = document.getElementById("formToggle");
  const formWrapper = document.getElementById("formWrap");
  const formFrame = formWrapper ? formWrapper.querySelector("iframe") : null;
  const cliInput = document.getElementById("cliInput");
  const cliOutput = document.getElementById("cliOutput");
  const nodes = document.querySelectorAll(".node");
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const loader = document.getElementById("loader");
  const loaderStatus = document.getElementById("loaderStatus");
  const loaderProgressFill = document.getElementById("loaderProgressFill");
  const scrollButton = document.getElementById("scrollTopBtn");
  const themeKey = "theme";

  if (!uiToggleButton || !cliToggleButton || !uiMode || !cliMode || !themeToggleButton) {
    console.error("UI init failed");
    return;
  }

  let currentProgress = 0;
  let loaderAnimationFrame = 0;
  let loaderStageTimeout = 0;
  let isLoaderComplete = false;

  const setLoaderProgress = (value) => {
    if (!loaderProgressFill) {
      return;
    }

    const clampedValue = Math.max(0, Math.min(100, value));
    currentProgress = clampedValue;
    loaderProgressFill.style.transform = `scaleX(${clampedValue / 100})`;

    if (loaderStatus) {
      loaderStatus.textContent = `Loading ${clampedValue}%`;
    }
  };

  const animateLoaderProgress = (target, duration = 224) => {
    window.cancelAnimationFrame(loaderAnimationFrame);

    const start = currentProgress;
    const end = Math.max(start, Math.min(100, target));
    const startTime = performance.now();

    const easeOutCubic = (time) => 1 - Math.pow(1 - time, 3);

    const step = (now) => {
      const elapsed = Math.min(1, (now - startTime) / duration);
      const progressRatio = easeOutCubic(elapsed);
      const nextValue = start + (end - start) * progressRatio;

      setLoaderProgress(Math.round(nextValue));

      if (elapsed < 1) {
        loaderAnimationFrame = window.requestAnimationFrame(step);
      }
    };

    loaderAnimationFrame = window.requestAnimationFrame(step);
  };

  const startLoaderProgress = () => {
    const stages = [28, 58, 86, 96];
    const delays = [80, 95, 110, 125];
    let stageIndex = 0;

    const advanceStage = () => {
      if (isLoaderComplete || stageIndex >= stages.length) {
        return;
      }

      animateLoaderProgress(stages[stageIndex]);
      stageIndex += 1;

      if (stageIndex < stages.length) {
        loaderStageTimeout = window.setTimeout(advanceStage, delays[stageIndex - 1]);
      }
    };

    advanceStage();
  };

  const completeLoader = () => {
    if (isLoaderComplete) {
      return;
    }

    isLoaderComplete = true;
    window.clearTimeout(loaderStageTimeout);
    animateLoaderProgress(100, 180);

    window.setTimeout(() => {
      if (loader) {
        loader.classList.add("hidden");
      }
    }, 180);
  };

  const scheduleLoaderCompletion = () => {
    window.requestAnimationFrame(() => {
      window.setTimeout(completeLoader, 160);
    });
  };

  const setMode = (mode) => {
    const isUiMode = mode === "ui";

    uiMode.style.display = isUiMode ? "grid" : "none";
    cliMode.classList.toggle("hidden", isUiMode);

    uiToggleButton.classList.toggle("active", isUiMode);
    cliToggleButton.classList.toggle("active", !isUiMode);
  };

  const setTheme = (mode) => {
    const isLightMode = mode === "light";

    document.body.classList.toggle("light", isLightMode);
    document.body.classList.toggle("dark", !isLightMode);

    localStorage.setItem(themeKey, mode);
    themeToggleButton.textContent = isLightMode ? "☀ light" : "🌙 dark";

    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", isLightMode ? "#f5f7fb" : "#070a12");
    }
  };

  uiToggleButton.addEventListener("click", () => setMode("ui"));
  cliToggleButton.addEventListener("click", () => setMode("cli"));
  setMode("ui");

  const savedTheme = localStorage.getItem(themeKey);
  setTheme(savedTheme === "light" ? "light" : "dark");

  themeToggleButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.contains("light");
    setTheme(isLightMode ? "dark" : "light");
  });

  nodes.forEach((node) => {
    node.addEventListener("click", () => {
      nodes.forEach((currentNode) => currentNode.classList.remove("focus"));
      node.classList.add("focus");
    });
  });

  if (formToggleButton && formWrapper) {
    formToggleButton.addEventListener("click", () => {
      formWrapper.classList.toggle("hidden");

      if (formFrame && !formWrapper.classList.contains("hidden") && !formFrame.src) {
        formFrame.src = formFrame.dataset.src || "";
      }
    });
  }

  if (cliInput && cliOutput) {
    const applyLowercase = () => {
      const value = cliInput.value;
      const lowercasedValue = value.toLowerCase();

      if (value !== lowercasedValue) {
        const start = cliInput.selectionStart;
        const end = cliInput.selectionEnd;
        cliInput.value = lowercasedValue;

        if (start !== null && end !== null) {
          cliInput.setSelectionRange(start, end);
        }
      }
    };

    cliInput.addEventListener("beforeinput", (event) => {
      if (!event.data) {
        return;
      }

      const inputTypes = [
        "insertText",
        "insertReplacementText",
        "insertFromPaste",
        "insertFromDrop",
        "insertCompositionText"
      ];

      if (!inputTypes.includes(event.inputType)) {
        return;
      }

      event.preventDefault();

      const lowercasedData = event.data.toLowerCase();
      const start = cliInput.selectionStart ?? 0;
      const end = cliInput.selectionEnd ?? start;
      const currentValue = cliInput.value;
      const nextValue =
        currentValue.slice(0, start) + lowercasedData + currentValue.slice(end);

      cliInput.value = nextValue;
      cliInput.setSelectionRange(start + lowercasedData.length, start + lowercasedData.length);
    });

    cliInput.addEventListener("input", applyLowercase);

    cliInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      const command = cliInput.value.trim();
      cliInput.value = "";

      cliOutput.textContent += `\n> ${command}`;

      switch (command) {
        case "help":
          cliOutput.textContent += "\ncommands: help, infra, backend, security";
          break;
        case "infra":
          cliOutput.textContent += "\nINFRA: Linux, Windows Server, networking";
          break;
        case "backend":
          cliOutput.textContent += "\nBACKEND: PHP, MySQL, APIs";
          break;
        case "security":
          cliOutput.textContent += "\nSECURITY: audits, forensics";
          break;
        default:
          cliOutput.textContent += "\nunknown command";
      }

      cliOutput.scrollTop = cliOutput.scrollHeight;
    });
  }

  startLoaderProgress();

  scheduleLoaderCompletion();
  window.addEventListener("load", completeLoader, { once: true });

  if (scrollButton) {
    window.addEventListener("scroll", () => {
      scrollButton.classList.toggle("show", window.scrollY > 300);
    });

    scrollButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});
