const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
const backToTop = document.querySelector('.back-to-top');
const themeToggle = document.querySelector('.theme-toggle');
const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function updateActiveNav() {
  const sections = [...document.querySelectorAll('main section[id]')];
  const current = sections
    .filter((section) => section.getBoundingClientRect().top <= 140)
    .pop();

  document.querySelectorAll('.main-nav a[aria-current="page"]').forEach((link) => {
    link.removeAttribute('aria-current');
  });

  if (!current) return;
  const activeLink = document.querySelector(`.main-nav a[href="#${current.id}"]`);
  if (activeLink) activeLink.setAttribute('aria-current', 'page');
}

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.classList.toggle('light-mode', isLight);
  if (themeToggle) {
    themeToggle.textContent = isLight ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  }
  localStorage.setItem('himathTheme', theme);
  localStorage.setItem('resumeTheme', theme);
}

applyTheme(localStorage.getItem('himathTheme') || localStorage.getItem('resumeTheme') || 'dark');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
    applyTheme(nextTheme);
  });
}

document.querySelectorAll('.skill-meter').forEach((skill) => {
  const level = skill.dataset.level || '0';
  skill.style.setProperty('--level', `${level}%`);
});

const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
const projectCards = document.querySelectorAll('.project-card[data-category]');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    const filter = button.dataset.filter;
    projectCards.forEach((card) => {
      const categories = card.dataset.category.toLowerCase();
      const shouldShow = filter === 'all' || categories.includes(filter);

      if (shouldShow) {
        card.classList.remove('is-hidden');
        requestAnimationFrame(() => {
          card.classList.remove('is-hiding');
          card.classList.add('is-showing');
        });
      } else {
        card.classList.remove('is-showing');
        card.classList.add('is-hiding');
        window.setTimeout(() => {
          if (card.classList.contains('is-hiding')) {
            card.classList.add('is-hidden');
          }
        }, 240);
      }
    });
  });
});

function shouldUseBackend() {
  return window.location.protocol.startsWith('http') && window.location.hostname !== '';
}

window.addEventListener('scroll', () => {
  if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
  updateActiveNav();
});

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

updateActiveNav();


// --- Premium portfolio upgrades ---
const glow = document.querySelector('.cursor-glow');
if (glow && matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    document.body.classList.add('has-cursor');
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
}

const typewriter = document.querySelector('.typewriter');
if (typewriter) {
  const roles = (typewriter.dataset.roles || '').split(',').map((role) => role.trim()).filter(Boolean);
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tickTypewriter() {
    const currentRole = roles[roleIndex] || 'Developer';
    typewriter.textContent = currentRole.slice(0, charIndex);

    if (!deleting && charIndex < currentRole.length) {
      charIndex += 1;
      setTimeout(tickTypewriter, 75);
      return;
    }

    if (!deleting && charIndex === currentRole.length) {
      deleting = true;
      setTimeout(tickTypewriter, 1300);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      setTimeout(tickTypewriter, 38);
      return;
    }

    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(tickTypewriter, 240);
  }

  tickTypewriter();
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll('.reveal, .skill-meter').forEach((item) => revealObserver.observe(item));

function showToast(message, type = '') {
  const root = document.querySelector('#toastRoot');
  if (!root) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`.trim();
  toast.textContent = message;
  root.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    window.setTimeout(() => toast.remove(), 220);
  }, 3200);
}


document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      showToast('Email copied. Clean move 😎', 'success');
      button.textContent = 'Copied';
      window.setTimeout(() => { button.textContent = 'Copy'; }, 1600);
    } catch (error) {
      showToast('Copy failed. You can still select the email manually.', 'error');
    }
  });
});



const contactForm = document.querySelector('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !message) {
      showToast('Add your name and message first.', 'error');
      return;
    }

    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email || 'Not provided'}\n\n${message}`);
    window.location.href = `mailto:Himath.Chandrasena@gmail.com?subject=${subject}&body=${body}`;
    showToast('Opening your email app. No backend storage, no uploads.', 'success');
    contactForm.reset();
  });
}

async function loadGitHubStats() {
  const stats = document.querySelector('#githubStats');
  if (!stats) return;
  const note = document.querySelector('#githubNote');

  function paintStats(payload) {
    document.querySelectorAll('[data-github="repos"]').forEach((item) => { item.textContent = payload.publicRepos ?? '5+'; });
    document.querySelectorAll('[data-github="reposMini"]').forEach((item) => { item.textContent = payload.publicRepos ?? '5+'; });
    document.querySelectorAll('[data-github="followers"]').forEach((item) => { item.textContent = payload.followers ?? '--'; });
    document.querySelectorAll('[data-github="stars"]').forEach((item) => { item.textContent = payload.stars ?? '--'; });
    if (note) note.textContent = `Updated for @${payload.username || 'HimathKc'} via ${payload.source || 'GitHub API'}.`;
  }

  try {
    if (shouldUseBackend()) {
      const backendResponse = await fetch('/api/github-stats');
      if (backendResponse.ok) {
        paintStats(await backendResponse.json());
        return;
      }
    }

    const [userResponse, reposResponse] = await Promise.all([
      fetch('https://api.github.com/users/HimathKc'),
      fetch('https://api.github.com/users/HimathKc/repos?per_page=100&sort=updated')
    ]);

    if (!userResponse.ok || !reposResponse.ok) throw new Error('GitHub API unavailable');
    const user = await userResponse.json();
    const repos = await reposResponse.json();
    const stars = repos.reduce((total, repo) => total + (repo.stargazers_count || 0), 0);
    paintStats({ username: user.login, publicRepos: user.public_repos ?? repos.length, followers: user.followers ?? 0, stars, source: 'browser GitHub API fallback' });
  } catch (error) {
    paintStats({ username: 'HimathKc', publicRepos: '5+', followers: '--', stars: '--', source: 'fallback stats' });
    if (note) note.textContent = 'Could not reach GitHub API, so the card is showing fallback portfolio stats.';
  }
}

loadGitHubStats();

// Keep skill meters filled even if a browser delays IntersectionObserver animations.
document.querySelectorAll('.skill-meter').forEach((skill) => {
  const level = skill.dataset.level || '0';
  skill.style.setProperty('--level', `${level}%`);
  skill.classList.add('in-view');
});
