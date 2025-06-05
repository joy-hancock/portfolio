// Theme Toggle
const themeToggle = document.getElementById('theme-checkbox');
const themeLabel = document.querySelector('.theme-label');

function toggleTheme() {
  const isDark = themeToggle.checked;

  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  }

  themeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
}

// Handle click event (default)
themeToggle.addEventListener('change', toggleTheme);

// Handle keyboard events
themeToggle.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    // Toggle checkbox state
    themeToggle.checked = !themeToggle.checked;

    toggleTheme();

    event.preventDefault();
  }
});

// Load saved theme from local storage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  themeToggle.checked = true;
  document.documentElement.setAttribute('data-theme', 'dark');
  themeLabel.textContent = 'Dark Mode';
} else {
  themeToggle.checked = false;
  themeLabel.textContent = 'Light Mode';
}

// Search and filter projects

const searchInput = document.getElementById('projectSearch');
const projectCards = document.querySelectorAll('.card');
const cardsContainer = document.getElementById('cards');

(function addStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .card {
      transition: opacity 0.35s ease, transform 0.35s ease;
      opacity: 1;
      transform: scale(1);
    }
    
    .card.hidden-card {
      display: none !important;
      opacity: 0;
      transform: scale(0.95);
    }
    
    .card.fade-out {
      opacity: 0;
      transform: scale(0.95);
      pointer-events: none;
    }
    
    .cards-container-fixed-height {
      min-height: var(--original-height);
    }
  `;
  document.head.appendChild(styleElement);
})();

// Debounce function
function debounce(func, delay = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

let isScrollingToSearch = false;

// Function to filter projects with fixed height container
function filterProjects(searchTerm) {
  searchTerm = searchTerm.toLowerCase().trim();

  // Step 1: Measure and set the current height of the cards container
  const containerHeight = cardsContainer.offsetHeight;
  cardsContainer.style.setProperty('--original-height', `${containerHeight}px`);
  cardsContainer.classList.add('cards-container-fixed-height');

  // Step 2: Prepare for filtering
  const toHide = [];
  const toShow = [];

  projectCards.forEach((card) => {
    const isCurrentlyHidden = card.classList.contains('hidden-card');
    let shouldDisplay = false;

    if (searchTerm === '') {
      shouldDisplay = true;
    } else {
      const projectTitle = card.querySelector('h3').textContent.toLowerCase();

      if (!card.keywords) {
        card.keywords = Array.from(card.querySelectorAll('.keyword')).map(
          (keyword) => keyword.textContent.toLowerCase()
        );
      }

      shouldDisplay =
        projectTitle.includes(searchTerm) ||
        card.keywords.some((keyword) => keyword.includes(searchTerm));
    }

    if (!shouldDisplay && !isCurrentlyHidden) {
      toHide.push(card);
    } else if (shouldDisplay && isCurrentlyHidden) {
      toShow.push(card);
    }
  });

  // Step 3: Process hiding cards
  if (toHide.length) {
    toHide.forEach((card) => {
      card.classList.add('fade-out');
    });

    setTimeout(() => {
      toHide.forEach((card) => {
        card.classList.add('hidden-card');
        card.classList.remove('fade-out');
      });
    }, 350);
  }

  // Step 4: Process showing cards
  if (toShow.length) {
    toShow.forEach((card) => {
      card.classList.remove('hidden-card');
      card.classList.add('fade-out');
    });

    // Force reflow
    toShow[0]?.offsetHeight;

    setTimeout(() => {
      toShow.forEach((card) => {
        card.classList.remove('fade-out');
      });
    }, 20);
  }

  // Step 5: After all transitions, gradually release the fixed height
  setTimeout(() => {
    // First measure what the natural height would be
    const naturalHeight = cardsContainer.scrollHeight;

    // If natural height is less than our fixed height, we need to transition
    if (naturalHeight < containerHeight) {
      // Create a transition for the height change
      cardsContainer.style.transition = 'min-height 0.3s ease-out';

      // Set a slightly longer minimum height to avoid jumps
      cardsContainer.style.setProperty(
        '--original-height',
        `${naturalHeight + 10}px`
      );

      // Finally remove the fixed height constraint
      setTimeout(() => {
        cardsContainer.classList.remove('cards-container-fixed-height');
        cardsContainer.style.transition = '';
      }, 300);
    } else {
      cardsContainer.classList.remove('cards-container-fixed-height');
    }
  }, 400);
}

// Function to handle search input with debouncing
const debouncedSearch = debounce((value) => {
  filterProjects(value);
}, 250);

// Event listener for search input
searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

// Scroll to search field when it's clicked
searchInput.addEventListener('focus', () => {
  if (isScrollingToSearch) return;

  const rect = searchInput.getBoundingClientRect();

  // Only scroll if the search field is not comfortably visible
  if (rect.top < 50 || rect.top > window.innerHeight / 3) {
    isScrollingToSearch = true;

    const targetY = window.scrollY + rect.top - window.innerHeight * 0.2;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });

    setTimeout(() => {
      isScrollingToSearch = false;
    }, 500);
  }
});

// Initialize on page load
window.addEventListener('load', () => {
  // Pre-compute keywords for performance
  projectCards.forEach((card) => {
    card.keywords = Array.from(card.querySelectorAll('.keyword')).map(
      (keyword) => keyword.textContent.toLowerCase()
    );
  });
});

// Scroll to Top Button with Intersection Observer

const scrollTopBtn = document.getElementById('scrollTopBtn');
const scrollSentinel = document.getElementById('scroll-sentinel');

if (scrollTopBtn && scrollSentinel) {
  const scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // If the sentinel is not intersecting (scrolled past it), show the button
        if (!entry.isIntersecting) {
          scrollTopBtn.classList.add('visible');
        } else {
          // If the sentinel is intersecting (scrolled back above it), hide the button
          scrollTopBtn.classList.remove('visible');
        }
      });
    },
    {
      rootMargin: '0px',
      threshold: 0,
    }
  );

  // Set up the Intersection Observer

  // Start observing the sentinel
  scrollObserver.observe(scrollSentinel);

  // Add click event to the button
  scrollTopBtn.addEventListener('click', () => {
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}
