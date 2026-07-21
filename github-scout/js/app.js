const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const cardContainer = document.getElementById('cardContainer');
const featuredGrid = document.getElementById('featuredGrid');
const totalScouted = document.getElementById('totalScouted');

let scoutedCount = parseInt(localStorage.getItem('gitscout_count') || '0');
totalScouted.textContent = scoutedCount.toLocaleString();

const statIds = {
  pac: { fill: 'statPac', val: 'statPacVal', label: 'PAC' },
  dri: { fill: 'statDri', val: 'statDriVal', label: 'DRI' },
  sho: { fill: 'statSho', val: 'statShoVal', label: 'SHO' },
  def: { fill: 'statDef', val: 'statDefVal', label: 'DEF' },
  pas: { fill: 'statPas', val: 'statPasVal', label: 'PAS' },
  phy: { fill: 'statPhy', val: 'statPhyVal', label: 'PHY' },
};

function getPosition(overall) {
  if (overall >= 94) return 'ST';
  if (overall >= 88) return 'CM';
  if (overall >= 80) return 'CAM';
  if (overall >= 70) return 'RM';
  if (overall >= 55) return 'LM';
  return 'CDM';
}

function getStatColor(val) {
  if (val >= 90) return 'var(--accent)';
  if (val >= 80) return 'var(--green)';
  if (val >= 70) return 'var(--yellow)';
  if (val >= 55) return 'var(--orange)';
  return 'var(--red)';
}

function getBadgeColor(val) {
  if (val >= 93) { cardContainer.querySelector('.card-badge').style.color = 'var(--accent)'; return; }
  if (val >= 85) { cardContainer.querySelector('.card-badge').style.color = 'var(--green)'; return; }
  if (val >= 70) { cardContainer.querySelector('.card-badge').style.color = 'var(--yellow)'; return; }
  cardContainer.querySelector('.card-badge').style.color = 'var(--orange)';
}

function getPositionColor(pos) {
  const colors = { ST: 'var(--accent)', CM: 'var(--blue)', CAM: 'var(--purple)', RM: 'var(--green)', LM: 'var(--yellow)', CDM: 'var(--red)' };
  return colors[pos] || 'var(--accent)';
}

function getFlagEmoji(countryCode) {
  if (!countryCode) return '';
  const codePoints = countryCode.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

function getTopLanguage(repos) {
  const langs = {};
  for (const r of repos) {
    if (r.language) langs[r.language] = (langs[r.language] || 0) + 1;
  }
  return Object.entries(langs).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
}

function getLanguageIcon(lang) {
  const icons = {
    JavaScript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    TypeScript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    Python: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    Rust: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg',
    Go: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
    Java: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    C: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
    'C++': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
    Ruby: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg',
    PHP: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
    Swift: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg',
    Kotlin: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
    Scala: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scala/scala-original.svg',
    Dart: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg',
    Lua: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/lua/lua-original.svg',
    Haskell: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/haskell/haskell-original.svg',
    Elixir: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/elixir/elixir-original.svg',
    Clojure: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/clojure/clojure-original.svg',
    'C#': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
    HTML: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    CSS: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
  };
  return icons[lang] || null;
}

function calculateStats(user, repos) {
  const followers = user.followers || 0;
  const publicRepos = user.public_repos || 0;
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
  const langs = new Set(repos.filter(r => r.language).map(r => r.language));
  const hasReadme = repos.filter(r => r.description).length;
  const hasTopics = repos.filter(r => r.topics && r.topics.length > 0).length;
  const accountAge = (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24);
  const recentCount = repos.filter(r => (new Date() - new Date(r.updated_at)) / (1000 * 60 * 60 * 24) < 30).length;
  const totalSize = repos.reduce((sum, r) => sum + (r.size || 0), 0);

  const pac = Math.min(99, Math.round(
    Math.log2(recentCount + 1) * 15 +
    (publicRepos > 30 ? 25 : publicRepos * 0.8) +
    (accountAge > 365 ? 15 : accountAge / 365 * 15) + 5
  ));

  const dri = Math.min(99, Math.round(
    langs.size * 7 +
    (publicRepos > 15 ? 15 : publicRepos) +
    (langs.size > 3 ? 20 : langs.size * 5) + 10
  ));

  const sho = Math.min(99, Math.round(
    Math.log2(totalStars + 1) * 12 +
    (totalStars > 500 ? 20 : totalStars > 100 ? 15 : totalStars > 10 ? 8 : 2) +
    (repos.filter(r => r.stargazers_count > 10).length * 3) + 5
  ));

  const def = Math.min(99, Math.round(
    (publicRepos > 0 ? (hasReadme / publicRepos) * 35 : 0) +
    (hasTopics * 2) +
    Math.log2(totalSize + 1) * 2 +
    (user.blog ? 8 : 0) + (user.company ? 8 : 0) + 8
  ));

  const pas = Math.min(99, Math.round(
    Math.log2(totalForks + 1) * 12 +
    (totalForks > 50 ? 20 : totalForks > 10 ? 12 : totalForks * 0.5) +
    (repos.filter(r => r.fork).length * 2) +
    (user.public_repos > 5 ? 10 : 0) + 8
  ));

  const phy = Math.min(99, Math.round(
    Math.log2(followers + 1) * 10 +
    (followers > 1000 ? 30 : followers > 100 ? 20 : followers > 10 ? 10 : followers * 0.5) +
    Math.min(25, accountAge / 365 * 25) + 5
  ));

  return { pac, dri, sho, def: Math.min(99, def), pas, phy };
}

function updateCard(user, repos) {
  const stats = calculateStats(user, repos);
  const values = [stats.pac, stats.dri, stats.sho, stats.def, stats.pas, stats.phy];
  const overall = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const position = getPosition(overall);

  document.getElementById('overallRating').textContent = overall;
  document.getElementById('cardBadge').textContent = overall;
  document.getElementById('cardPosition').textContent = position;
  document.getElementById('cardPosition').style.color = getPositionColor(position);
  document.getElementById('cardName').textContent = user.login.toUpperCase();
  document.getElementById('cardHandle').textContent = '@' + user.login;
  document.getElementById('footerHandle').textContent = '@' + user.login;
  document.getElementById('cardAvatar').querySelector('img').src = user.avatar_url + '?s=240';

  const lang = getTopLanguage(repos);
  const langIcon = getLanguageIcon(lang);
  const flagsHtml = `<span class="lang-icon">${langIcon ? `<img src="${langIcon}" alt="${lang}" style="width:18px;height:18px;vertical-align:middle;" />` : '💻'}</span>`;
  document.getElementById('cardFlags').innerHTML = flagsHtml;

  getBadgeColor(overall);

  for (const [key, ids] of Object.entries(statIds)) {
    const val = stats[key];
    const color = getStatColor(val);
    document.getElementById(ids.fill).style.width = val + '%';
    document.getElementById(ids.fill).style.background = `linear-gradient(90deg, ${color}, ${color}dd)`;
    document.getElementById(ids.val).textContent = val;
    document.getElementById(ids.val).style.color = color;
    document.getElementById(ids.fill).parentElement.previousElementSibling.style.color = color;
  }

  // Card glow based on overall
  const glowIntensity = Math.min(30, Math.max(6, overall * 0.3));
  document.querySelector('.card').style.boxShadow =
    `0 20px 60px rgba(0,0,0,0.5), 0 0 ${glowIntensity}px rgba(0,255,136,${0.04 + overall * 0.001})`;

  cardContainer.classList.remove('hidden');
  cardContainer.style.animation = 'none';
  requestAnimationFrame(() => {
    cardContainer.style.animation = 'cardAppear 0.6s ease-out';
  });
}

async function scoutUser(username) {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!clean) return;

  loading.classList.remove('hidden');
  error.classList.add('hidden');
  cardContainer.classList.add('hidden');

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${clean}`),
      fetch(`https://api.github.com/users/${clean}/repos?per_page=100&sort=updated`)
    ]);

    if (!userRes.ok) throw new Error('Not found');
    const user = await userRes.json();
    const repos = await reposRes.json();

    updateCard(user, repos);

    scoutedCount++;
    localStorage.setItem('gitscout_count', String(scoutedCount));
    totalScouted.textContent = scoutedCount.toLocaleString();

    loading.classList.add('hidden');
  } catch (e) {
    loading.classList.add('hidden');
    error.classList.remove('hidden');
    setTimeout(() => error.classList.add('hidden'), 4000);
  }
}

// Event listeners
searchBtn.addEventListener('click', () => scoutUser(searchInput.value));
searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') scoutUser(searchInput.value); });

featuredGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.featured-card');
  if (card) {
    const user = card.dataset.user;
    searchInput.value = user;
    scoutUser(user);
  }
});

// Auto-load a default
setTimeout(() => {
  searchInput.value = 'torvalds';
  scoutUser('torvalds');
}, 500);
