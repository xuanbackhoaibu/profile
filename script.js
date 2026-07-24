const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#siteNav");
const siteHeader = document.querySelector(".site-header");
const scrollProgress = document.querySelector(".scroll-progress");
const year = document.querySelector("#year");
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const hero = document.querySelector(".hero");
const heroCanvas = document.querySelector("#heroCanvas");
const contentSections = [...document.querySelectorAll(".section")];
const revealTargets = [
  ...document.querySelectorAll(
    ".section__heading, .about__layout > *, .profile-shell > *, .objective-card, .fit-grid article, .resume-card, .recruiter-strip article, .skill-grid article, .project-card, .academic-card, .timeline article, .contact__layout > *, .contact-cta > *, .contact-card a, .detail-grid article, .tag-list li, .project-actions > *",
  ),
];
const projectCards = [...document.querySelectorAll(".project-card")];
const depthCards = [
  ...document.querySelectorAll(".project-card, .resume-card, .academic-card, .timeline article, .identity-card, .objective-card, .fit-grid article, .contact-cta, .contact-card"),
];
const tiltCards = [
  ...document.querySelectorAll(".project-card, .resume-card, .academic-card, .fit-grid article, .identity-card, .objective-card"),
];
const shineTargets = [
  ...depthCards,
  ...document.querySelectorAll(".button, .project-actions a, .text-link, .back-link"),
];
const tagItems = [...document.querySelectorAll(".tag-list li")];
const timelines = [...document.querySelectorAll(".timeline")];
const canAnimatePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) {
  year.textContent = new Date().getFullYear();
}

tagItems.forEach((tag, index) => {
  tag.style.setProperty("--tag-index", index % 12);
});

function updateHeaderState() {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);

  if (scrollProgress) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    scrollProgress.style.setProperty("--scroll-progress", `${Math.min(progress, 100)}%`);
  }

  if (hero) {
    const heroHeight = Math.max(hero.offsetHeight, 1);
    const scrollRatio = Math.min(window.scrollY / heroHeight, 1);
    document.documentElement.style.setProperty("--hero-scroll", scrollRatio.toFixed(3));
  }

  timelines.forEach((timeline) => {
    const rect = timeline.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const progress = 1 - Math.max(Math.min((rect.bottom - viewport * 0.72) / (rect.height + viewport * 0.18), 1), 0);
    timeline.style.setProperty("--timeline-progress", Math.max(progress, 0.18).toFixed(3));
  });
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      siteNav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
  );

  revealTargets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.setProperty("--reveal-delay", `${Math.min(index % 8, 5) * 70}ms`);
    revealObserver.observe(target);
  });

  if (navLinks.length > 0 && sections.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { threshold: 0.48 },
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  if (contentSections.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("section-in-view", entry.isIntersecting);
        });
      },
      { threshold: 0.18 },
    );

    contentSections.forEach((section) => sectionObserver.observe(section));
  }
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
  contentSections.forEach((section) => section.classList.add("section-in-view"));
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

if (canAnimatePointer) {
  window.addEventListener(
    "pointermove",
    (event) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const depthX = ((event.clientX - centerX) / centerX) * 18;
      const depthY = ((event.clientY - centerY) / centerY) * 14;

      document.body.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.body.style.setProperty("--cursor-y", `${event.clientY}px`);
      document.documentElement.style.setProperty("--depth-x", `${depthX.toFixed(2)}px`);
      document.documentElement.style.setProperty("--depth-y", `${depthY.toFixed(2)}px`);
    },
    { passive: true },
  );

  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const strength = card.classList.contains("project-card") ? 7 : 4;

      card.classList.add("is-tilting");
      card.style.setProperty("--tilt-x", `${x * strength}deg`);
      card.style.setProperty("--tilt-y", `${y * -strength}deg`);
      card.style.setProperty("--shine-x", `${(x + 0.5) * 100}%`);
      card.style.setProperty("--shine-y", `${(y + 0.5) * 100}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
      card.style.removeProperty("--shine-x");
      card.style.removeProperty("--shine-y");
    });
  });

  shineTargets.forEach((target) => {
    target.addEventListener("pointermove", (event) => {
      const rect = target.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty("--shine-x", `${x}%`);
      target.style.setProperty("--shine-y", `${y}%`);
    });

    target.addEventListener("pointerleave", () => {
      target.style.removeProperty("--shine-x");
      target.style.removeProperty("--shine-y");
    });
  });

  contentSections.forEach((section) => {
    section.addEventListener("pointermove", (event) => {
      const rect = section.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      section.style.setProperty("--section-x", `${x}%`);
      section.style.setProperty("--section-y", `${y}%`);
    });
  });
}

async function initHeroScene() {
  if (!heroCanvas || reduceMotion) return;

  try {
    const THREE = await import("https://unpkg.com/three@0.165.0/build/three.module.js");
    const renderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    const group = new THREE.Group();
    const particles = new THREE.Group();
    const clock = new THREE.Clock();

    camera.position.set(0, 0, 8);
    scene.add(group);
    scene.add(particles);

    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x70f0b2,
      emissive: 0x12392c,
      roughness: 0.32,
      metalness: 0.62,
      transparent: true,
      opacity: 0.72,
    });
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xf2cc55,
      transparent: true,
      opacity: 0.36,
    });
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0xaafdda,
      transparent: true,
      opacity: 0.62,
    });

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const particleGeometry = new THREE.IcosahedronGeometry(0.035, 1);
    const cubePositions = [
      [3.2, 1.45, -1.2],
      [4.45, -0.62, -0.4],
      [2.2, -2.0, -1.9],
      [5.35, 1.9, -2.6],
    ];

    cubePositions.forEach((position, index) => {
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial.clone());
      const edges = new THREE.EdgesGeometry(cubeGeometry);
      const wire = new THREE.LineSegments(edges, lineMaterial.clone());

      cube.position.set(...position);
      cube.scale.setScalar(0.62 + index * 0.12);
      cube.rotation.set(0.7 + index * 0.2, 0.72 - index * 0.12, 0.25);
      wire.position.copy(cube.position);
      wire.scale.copy(cube.scale);
      wire.rotation.copy(cube.rotation);
      group.add(cube, wire);
    });

    for (let index = 0; index < 64; index += 1) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(
        1.2 + Math.random() * 5.6,
        -2.5 + Math.random() * 5,
        -3.2 + Math.random() * 3,
      );
      particle.userData.speed = 0.28 + Math.random() * 0.72;
      particles.add(particle);
    }

    scene.add(new THREE.AmbientLight(0xaafdda, 0.9));
    const keyLight = new THREE.PointLight(0x70f0b2, 5, 18);
    keyLight.position.set(1.5, 2.4, 4);
    scene.add(keyLight);

    function resize() {
      const rect = heroCanvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();
    }

    function animate() {
      const elapsed = clock.getElapsedTime();
      const scrollRatio = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hero-scroll")) || 0;

      group.rotation.y = elapsed * 0.16 + scrollRatio * 0.45;
      group.rotation.x = Math.sin(elapsed * 0.48) * 0.12;
      group.position.y = Math.sin(elapsed * 0.38) * 0.12 - scrollRatio * 0.6;
      particles.children.forEach((particle, index) => {
        particle.position.y += 0.004 * particle.userData.speed;
        particle.rotation.y = elapsed * (0.28 + index * 0.002);
        if (particle.position.y > 2.8) particle.position.y = -2.6;
      });

      renderer.render(scene, camera);
      window.requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener("resize", resize, { passive: true });
  } catch (error) {
    heroCanvas.setAttribute("hidden", "");
  }
}

initHeroScene();
