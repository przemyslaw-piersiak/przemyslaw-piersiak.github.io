document.addEventListener("DOMContentLoaded", () => {
  const uiBtn = document.getElementById("uiBtn");
  const cliBtn = document.getElementById("cliBtn");
  const themeBtn = document.getElementById("themeBtn");
  const uiMode = document.getElementById("uiMode");
  const cliMode = document.getElementById("cliMode");
  const formToggle = document.getElementById("formToggle");
  const formWrap = document.getElementById("formWrap");
  const cliInput = document.getElementById("cliInput");
  const cliOutput = document.getElementById("cliOutput");
  const nodes = document.querySelectorAll(".node");
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const THEME_KEY = "theme";

  if (!uiBtn || !cliBtn || !uiMode || !cliMode || !themeBtn) {
    console.error("UI init failed");
    return;
  }

  function setMode(mode) {
    const isUI = mode === "ui";

    uiMode.style.display = isUI ? "grid" : "none";
    cliMode.classList.toggle("hidden", isUI);

    uiBtn.classList.toggle("active", isUI);
    cliBtn.classList.toggle("active", !isUI);
  }

  uiBtn.addEventListener("click", () => setMode("ui"));
  cliBtn.addEventListener("click", () => setMode("cli"));
  setMode("ui");

  function setTheme(mode) {
    const isLight = mode === "light";

    document.body.classList.toggle("light", isLight);
    document.body.classList.toggle("dark", !isLight);

    localStorage.setItem(THEME_KEY, mode);

    themeBtn.textContent = isLight ? "☀ light" : "🌙 dark";

    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", isLight ? "#f5f7fb" : "#070a12");
    }
  }

  const savedTheme = localStorage.getItem(THEME_KEY);
  setTheme(savedTheme === "light" ? "light" : "dark");

  themeBtn.addEventListener("click", () => {
    const isLight = document.body.classList.contains("light");
    setTheme(isLight ? "dark" : "light");
  });

  nodes.forEach(node => {
    node.addEventListener("click", () => {
      nodes.forEach(n => n.classList.remove("focus"));
      node.classList.add("focus");
    });
  });

  if (formToggle && formWrap) {
    formToggle.addEventListener("click", () => {
      formWrap.classList.toggle("hidden");
    });
  }

  if (cliInput && cliOutput) {
    cliInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      const cmd = cliInput.value.trim();
      cliInput.value = "";

      cliOutput.textContent += `\n> ${cmd}`;

      switch (cmd) {
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

  const loader = document.getElementById("loader");

  window.addEventListener("load", () => {
    setTimeout(() => {
      if (loader) {
        loader.classList.add("hidden");
      }
    }, 250);
  });

  const scrollBtn = document.getElementById("scrollTopBtn");

  if (scrollBtn) {
    window.addEventListener("scroll", () => {
      scrollBtn.classList.toggle("show", window.scrollY > 300);
    });

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});
