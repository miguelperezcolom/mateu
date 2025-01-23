// main script
(function () {
  "use strict";

  // Navbar Toggler
  // ----------------------------------------
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarMenu = document.querySelector(".navbar-wrapper");
  navbarToggler?.addEventListener("click", (e) => {
    navbarToggler.classList.toggle("active");
    navbarMenu.classList.toggle("active");
  });

  // Sidebar Collapse in Small Devices
  // ----------------------------------------
  const sidebar = document.querySelector(".sidebar");
  const sidebarToggleBtn = document.querySelector(".sidebar-toggler");
  sidebarToggleBtn?.addEventListener("click", () => {
    if (!sidebarToggleBtn.classList.contains("active")) {
      let overlay = document.querySelector(".sidebar-overlay");
      overlay.addEventListener("click", () => {
        sidebarToggleBtn.click();
      });
    }
    sidebarToggleBtn.classList.toggle("active");
    sidebar.classList.toggle("active");
  });

  // Dropdown Menu Toggler For Mobile
  // ----------------------------------------
  const dropdownMenuToggler = document.querySelectorAll(
    ".nav-dropdown > .nav-link"
  );
  dropdownMenuToggler.forEach((toggler) => {
    toggler?.addEventListener("click", (e) => {
      e.target.parentElement.classList.toggle("active");
    });
  });

  // Code Copy
  // ----------------------------------------
  let blocks = document.querySelectorAll("pre");

  async function copyCode(block, button) {
    let code = block.querySelector("code");
    let text = code.innerText;
    await navigator.clipboard.writeText(text);
    button.innerText = "copied";
    setTimeout(() => {
      button.innerText = "copy";
    }, 700);
  }

  blocks.forEach((block) => {
    if (navigator.clipboard) {
      let button = document.createElement("span");
      button.innerText = "copy";
      button.className = "copy";
      block.appendChild(button);
      button?.addEventListener("click", async () => {
        await copyCode(block, button);
      });
    }
  });

  // table of content
  let toc = document.querySelector("#TableOfContents a");
  if (toc) {
    new ScrollMenu("#TableOfContents a", {
      duration: 50,
      activeOffset: 135,
      scrollOffset: 130,
    });
  }

  // changelog
  let changelogLink = document.querySelector(".changelog-link a");
  if (changelogLink) {
    new ScrollMenu(".changelog-link a", {
      duration: 50,
      activeOffset: 110,
      scrollOffset: 105,
    });
  }
})();
