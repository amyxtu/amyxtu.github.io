// Curated San Jose favorites (Yelp Elite picks): sample data for the demo.
// price: 1=$ 2=$$ 3=$$$ 4=$$$$
const SPOTS = [
  { name: 'Adega', cuisine: 'Portuguese', price: 4, rating: 4.6, occ: ['Date Night','Celebration','Business Dinner'], blurb: 'Michelin-recognized Portuguese tasting menus in Little Portugal.' },
  { name: 'Original Joe\'s', cuisine: 'Italian', price: 3, rating: 4.4, occ: ['Family','Celebration','Date Night'], blurb: 'A San Jose institution since 1956, with big booths and old-school service.' },
  { name: 'Falafel\'s Drive-In', cuisine: 'Middle Eastern', price: 1, rating: 4.6, occ: ['Quick Bite','Casual'], blurb: 'Legendary banana milkshakes and falafel wraps at a walk-up window.' },
  { name: 'Bill\'s Cafe', cuisine: 'American', price: 2, rating: 4.3, occ: ['Brunch','Family','Casual'], blurb: 'Generous brunch plates and bottomless coffee, always a wait.' },
  { name: 'La Victoria Taqueria', cuisine: 'Mexican', price: 1, rating: 4.4, occ: ['Late Night','Quick Bite','Casual'], blurb: 'The orange sauce is a downtown legend, open late for post-night bites.' },
  { name: 'Vung Tau', cuisine: 'Vietnamese', price: 2, rating: 4.4, occ: ['Family','Casual','Celebration'], blurb: 'Beloved Vietnamese classics; the shaking beef is a must-order.' },
  { name: 'Back A Yard', cuisine: 'Caribbean', price: 2, rating: 4.5, occ: ['Casual','Quick Bite','Family'], blurb: 'Jerk chicken and oxtail that regulars drive across town for.' },
  { name: 'Zeni', cuisine: 'Ethiopian', price: 2, rating: 4.5, occ: ['Date Night','Casual','Family'], blurb: 'Shareable injera platters that are fun, hands-on, and great for groups.' },
  { name: 'The Table', cuisine: 'American', price: 3, rating: 4.5, occ: ['Brunch','Date Night','Celebration'], blurb: 'Willow Glen farm-to-table with a standout weekend brunch.' },
  { name: 'Smoking Pig BBQ', cuisine: 'BBQ', price: 2, rating: 4.4, occ: ['Casual','Family'], blurb: 'Brisket, ribs, and cornbread in a laid-back, no-fuss room.' },
  { name: 'Ramen Nagi', cuisine: 'Japanese', price: 2, rating: 4.5, occ: ['Casual','Quick Bite','Date Night'], blurb: 'Customizable tonkotsu bowls that are rich, porky, and quick.' },
  { name: 'LB Steak', cuisine: 'Steakhouse', price: 4, rating: 4.4, occ: ['Business Dinner','Celebration','Date Night'], blurb: 'Santana Row steakhouse for a polished, special-occasion dinner.' },
  { name: 'Sino', cuisine: 'Chinese', price: 3, rating: 4.2, occ: ['Business Dinner','Celebration','Date Night'], blurb: 'Upscale dim sum and cocktails with a lively Santana Row scene.' },
  { name: 'Pizza Bocca Lupo', cuisine: 'Pizza', price: 2, rating: 4.5, occ: ['Casual','Date Night','Family'], blurb: 'Blistered Neapolitan pies downtown with a great natural wine list.' },
  { name: 'Din Tai Fung', cuisine: 'Chinese', price: 3, rating: 4.4, occ: ['Family','Celebration','Casual'], blurb: 'Soup dumplings worth the Valley Fair wait, dependably excellent.' },
  { name: 'Bún Bò Huế An Nam', cuisine: 'Vietnamese', price: 1, rating: 4.5, occ: ['Quick Bite','Casual'], blurb: 'Spicy, lemongrass-forward bún bò Huế that locals swear by.' },
];

const CUISINES = ['Any', ...Array.from(new Set(SPOTS.map(s => s.cuisine))).sort()];
const OCCASIONS = ['Any','Date Night','Casual','Family','Business Dinner','Celebration','Brunch','Quick Bite','Late Night'];
const PRICE = p => '$'.repeat(p);

const cuisineSel = document.getElementById('cuisine');
const occasionSel = document.getElementById('occasion');
cuisineSel.innerHTML = CUISINES.map(c => `<option>${c}</option>`).join('');
occasionSel.innerHTML = OCCASIONS.map(o => `<option>${o}</option>`).join('');

function stars(r) {
  const full = Math.round(r);
  return '<span class="star">' + '★'.repeat(full) + '</span>' + '☆'.repeat(5 - full);
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function reason(s, cuisine, maxPrice, occasion) {
  const bits = [];
  if (cuisine !== 'Any') bits.push(`top-rated ${s.cuisine.toLowerCase()}`);
  else bits.push(`a ${s.rating.toFixed(1)}★ local favorite`);
  if (s.price <= maxPrice) bits.push(`fits your ${PRICE(s.price)} budget`);
  if (occasion !== 'Any' && s.occ.includes(occasion)) bits.push(`perfect for ${occasion.toLowerCase()}`);
  // Capitalize first
  const text = bits.join(', ');
  return text.charAt(0).toUpperCase() + text.slice(1) + '.';
}

function score(s, cuisine, maxPrice, occasion) {
  let sc = s.rating * 2;                    // quality baseline
  if (occasion !== 'Any' && s.occ.includes(occasion)) sc += 3; // occasion match
  if (cuisine !== 'Any' && s.cuisine === cuisine) sc += 2;      // cuisine match
  sc += (maxPrice - s.price) * 0.2;         // slight nudge toward value
  return sc;
}

function find() {
  const cuisine = cuisineSel.value;
  const maxPrice = parseInt(document.getElementById('budget').value, 10);
  const occasion = occasionSel.value;

  let matches = SPOTS.filter(s =>
    (cuisine === 'Any' || s.cuisine === cuisine) &&
    s.price <= maxPrice &&
    (occasion === 'Any' || s.occ.includes(occasion))
  );
  matches.sort((a, b) => score(b, cuisine, maxPrice, occasion) - score(a, cuisine, maxPrice, occasion));
  matches = matches.slice(0, 5);

  const results = document.getElementById('results');
  if (!matches.length) {
    results.innerHTML = `<p class="empty">No matches for that combination. Try a higher budget or a different cuisine.</p>`;
    return;
  }
  results.innerHTML =
    `<p class="count">${matches.length} pick${matches.length > 1 ? 's' : ''} for you</p>` +
    matches.map((s, i) => `
      <article class="rec">
        <div class="rec-top">
          <h3>${escapeHtml(s.name)}</h3>
          <span class="rank">0${i + 1}</span>
        </div>
        <p class="rec-meta">${s.cuisine} · ${PRICE(s.price)} · ${stars(s.rating)} ${s.rating.toFixed(1)}</p>
        <p class="rec-blurb">${escapeHtml(s.blurb)}</p>
        <p class="why"><b>Why it fits:</b> ${reason(s, cuisine, maxPrice, occasion)}</p>
      </article>`).join('');
}

document.getElementById('find').addEventListener('click', find);
find(); // show an initial set
