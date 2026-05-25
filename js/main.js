document.addEventListener("DOMContentLoaded", () => {
  const uiToggleButton = document.getElementById("uiBtn");
  const cliToggleButton = document.getElementById("cliBtn");
  const themeToggleButton = document.getElementById("themeBtn");
  const uiMode = document.getElementById("uiMode");
  const cliMode = document.getElementById("cliMode");
  const formToggleButton = document.getElementById("formToggle");
  const formWrapper = document.getElementById("formWrap");
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

  const setLoaderProgress = (value) => {
    if (!loaderProgressFill) {
      return;
    }

    const clampedValue = Math.max(0, Math.min(100, value));
    loaderProgressFill.style.width = `${clampedValue}%`;

    if (loaderStatus) {
      loaderStatus.textContent = `Loading ${clampedValue}%`;
    }
  };

  const startLoaderProgress = () => {
    const stages = [22, 48, 74, 90];
    const delays = [120, 180, 220, 260];
    let stageIndex = 0;

    const advanceStage = () => {
      if (stageIndex >= stages.length) {
        return;
      }

      setLoaderProgress(stages[stageIndex]);
      stageIndex += 1;

      if (stageIndex < stages.length) {
        window.setTimeout(advanceStage, delays[stageIndex - 1]);
      }
    };

    advanceStage();
  };

  const completeLoader = () => {
    setLoaderProgress(100);

    window.setTimeout(() => {
      if (loader) {
        loader.classList.add("hidden");
      }
    }, 180);
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
    });
  }

  if (cliInput && cliOutput) {
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

  window.addEventListener("load", completeLoader);

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
