// Navegación suave
document.addEventListener("DOMContentLoaded", function () {
  // Smooth scrolling para los enlaces de navegación
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const navHeight = document.querySelector(".main-nav").offsetHeight;
        const targetPosition = targetElement.offsetTop - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Efecto parallax ligero en el hero
  const hero = document.querySelector(".hero-section");
  if (hero) {
    window.addEventListener("scroll", function () {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * 0.5;

      if (scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${parallax}px)`;
      }
    });
  }

  // Animación de aparición de las cards al hacer scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Aplicar animación a las cards de proyectos
  const projectCards = document.querySelectorAll(".project-card");
  projectCards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
  });

  // Cambiar opacidad de la navegación al hacer scroll
  const nav = document.querySelector(".main-nav");
  if (nav) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 100) {
        nav.style.background = "rgba(255, 255, 255, 0.98)";
      } else {
        nav.style.background = "rgba(255, 255, 255, 0.95)";
      }
    });
  }

  const FILTER_ANIMATION_MS = 150;
  const galleryItems = document.querySelectorAll(".gallery-item");
  const yearLinks = document.querySelectorAll(".year-link");
  const projectsTitle = document.getElementById("projects-title");
  const homePage = document.querySelector(".home-page");
  const gallery = document.querySelector(".gallery");
  let activeYearFilter = null;

  function adjustPageHeight() {
    if (!homePage || !gallery) {
      return;
    }
    const galleryBottom = gallery.offsetTop + gallery.offsetHeight;
    homePage.style.minHeight = galleryBottom + 80 + "px";
  }

  // Abrir página individual al hacer click en una tarjeta de proyecto
  galleryItems.forEach((item) => {
    item.style.cursor = "pointer";
    item.addEventListener("click", function (e) {
      if (e.target.classList.contains("year-link")) {
        return;
      }

      const image = item.querySelector("img");
      if (!image) {
        return;
      }

      const match = image.getAttribute("src").match(/assets\/img\/proyectos\/([^/]+)\//);
      if (match && match[1]) {
        window.location.href = `${match[1]}.html`;
      }
    });
  });

  function showItemWithAnimation(item, animate) {
    if (item._hideTimeoutId) {
      clearTimeout(item._hideTimeoutId);
      item._hideTimeoutId = null;
    }
    if (!item.classList.contains("is-hidden") && !item.classList.contains("filter-exit") && !animate) {
      return;
    }

    item.classList.remove("is-hidden");
    item.classList.remove("filter-exit");

    if (!animate) {
      item.classList.remove("filter-enter");
      return;
    }

    item.classList.add("filter-enter");
    if (item._showRafId) {
      cancelAnimationFrame(item._showRafId);
    }
    item._showRafId = requestAnimationFrame(() => {
      item.classList.remove("filter-enter");
      item._showRafId = null;
    });

    if (item._enterTimeoutId) {
      clearTimeout(item._enterTimeoutId);
    }
    item._enterTimeoutId = setTimeout(() => {
      item.classList.remove("filter-enter");
      item._enterTimeoutId = null;
    }, FILTER_ANIMATION_MS);
  }

  function hideItemWithAnimation(item, animate) {
    if (item._hideTimeoutId) {
      clearTimeout(item._hideTimeoutId);
      item._hideTimeoutId = null;
    }
    if (item._showRafId) {
      cancelAnimationFrame(item._showRafId);
      item._showRafId = null;
    }
    if (item._enterTimeoutId) {
      clearTimeout(item._enterTimeoutId);
      item._enterTimeoutId = null;
    }

    if (!animate) {
      item.classList.remove("filter-enter", "filter-exit");
      item.classList.add("is-hidden");
      return;
    }

    item.classList.remove("filter-enter");
    item.classList.add("filter-exit");
    item._hideTimeoutId = setTimeout(() => {
      item.classList.add("is-hidden");
      item.classList.remove("filter-exit");
      item._hideTimeoutId = null;
      adjustPageHeight();
    }, FILTER_ANIMATION_MS);
  }

  function setYearsActive(selectedYear) {
    yearLinks.forEach((link) => {
      const isActive = selectedYear && link.getAttribute("data-filter") === selectedYear;
      link.classList.toggle("active", !!isActive);
      link.classList.toggle("was-active", !!isActive);
    });
  }

  function applyGalleryFilter(selectedYear, animate = true) {
    const shouldAnimate = animate && activeYearFilter !== null;
    activeYearFilter = selectedYear || null;

    galleryItems.forEach((item) => {
      const itemYear = item.getAttribute("data-year");
      const shouldShow = !activeYearFilter || itemYear === activeYearFilter;

      if (shouldShow) {
        showItemWithAnimation(item, shouldAnimate);
      } else {
        hideItemWithAnimation(item, shouldAnimate);
      }
    });

    setYearsActive(activeYearFilter);

    if (!shouldAnimate) {
      adjustPageHeight();
      return;
    }

    setTimeout(adjustPageHeight, FILTER_ANIMATION_MS + 10);
  }

  function resetGalleryFilter(animate = true) {
    if (!activeYearFilter) {
      return;
    }
    applyGalleryFilter(null, animate);
  }

  // Filtrado por años
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("year-link")) {
      e.preventDefault();

      const selectedYear = e.target.getAttribute("data-filter") || e.target.textContent.trim();
      const isSameYear = selectedYear === activeYearFilter;

      // Si ya estaba activo este año, mostrar todos
      if (isSameYear) {
        resetGalleryFilter();
        return;
      }

      // Marcar como activo y filtrar
      applyGalleryFilter(selectedYear);
    }

    // Reset filtro al clicar en "Proyectos"
    if (e.target.id === "projects-reset") {
      e.preventDefault();
      resetGalleryFilter();
    }
  });

  // Flecha scroll
  const scrollArrow = document.getElementById("scroll-arrow");
  if (scrollArrow) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 80) {
        scrollArrow.classList.add("visible");
      } else {
        scrollArrow.classList.remove("visible");
      }
    });

    scrollArrow.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (homePage && gallery) {
    applyGalleryFilter(null, false);
    // Ejecutar cuando las imágenes ya estén cargadas (no solo el DOM)
    window.addEventListener("load", adjustPageHeight);
    window.addEventListener("resize", adjustPageHeight);
  }
});