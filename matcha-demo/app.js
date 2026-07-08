// Curated Bay Area matcha spots (Yelp Elite picks): sample data for the demo.
// price: 1=$ 2=$$ 3=$$$
// styles: latte (matcha lattes), pure (traditional/ceremonial), dessert (soft serve, bakes), boba (boba and fruit twists)
const SPOTS = [
  { name: 'Binge Coffee House', city: 'San Jose', area: 'South Bay', price: 2, rating: 4.6,
    styles: ['latte'], vibes: ['Study or Work','Grab and Go','Date Spot'],
    popular: ['Iced matcha latte','Matcha cold foam','Strawberry matcha'],
    blurb: 'My home-turf San Jose pick, where the matcha menu holds its own against the espresso program.' },
  { name: 'Matcha Cafe Maiko', city: 'San Francisco', area: 'San Francisco', price: 2, rating: 4.5,
    styles: ['dessert','latte'], vibes: ['Grab and Go','Date Spot'],
    popular: ['Maiko Special parfait','Matcha soft serve','Matcha float'],
    blurb: 'Hawaii-born soft serve spot in Japantown. The Maiko Special parfait is always the move.' },
  { name: 'Asha Tea House', city: 'Berkeley', area: 'East Bay', price: 2, rating: 4.4,
    styles: ['latte','pure'], vibes: ['Study or Work','Grab and Go'],
    popular: ['Iced matcha latte','Hojicha latte','Jasmine milk tea'],
    blurb: 'A Berkeley staple steps from campus, pouring some of the most consistent matcha lattes in the East Bay.' },
  { name: 'Third Culture Bakery', city: 'Berkeley', area: 'East Bay', price: 2, rating: 4.6,
    styles: ['dessert','latte'], vibes: ['Grab and Go'],
    popular: ['Matcha mochi muffin','Matcha latte','Mochi donut'],
    blurb: 'Home of the original matcha mochi muffin. Come for the bakes, stay for the matcha latte.' },
  { name: 'Boba Guys', city: 'San Francisco', area: 'San Francisco', price: 2, rating: 4.3,
    styles: ['boba','latte'], vibes: ['Grab and Go','Date Spot'],
    popular: ['Strawberry matcha latte','Matcha with grass jelly','Hong Kong milk tea'],
    blurb: 'The strawberry matcha latte that launched a thousand copycats, still worth the line.' },
  { name: 'Kissako Tea', city: 'San Francisco', area: 'San Francisco', price: 1, rating: 4.4,
    styles: ['pure','dessert'], vibes: ['Grab and Go'],
    popular: ['Ceremonial matcha','Matcha soft serve','Genmaicha'],
    blurb: 'A quiet Japantown counter for proper whisked matcha when you want the real thing, no milk.' },
  { name: '7 Leaves Cafe', city: 'San Jose', area: 'South Bay', price: 1, rating: 4.3,
    styles: ['latte','boba'], vibes: ['Grab and Go','Study or Work'],
    popular: ['Japanese matcha soy','Sea cream matcha','Thai tea'],
    blurb: 'The Japanese matcha soy is a South Bay classic: smooth, not too sweet, dangerously drinkable.' },
  { name: 'Verve Coffee Roasters', city: 'Palo Alto', area: 'Peninsula', price: 2, rating: 4.4,
    styles: ['latte'], vibes: ['Study or Work','Date Spot'],
    popular: ['Matcha latte','Oat matcha','Nitro cold brew'],
    blurb: 'A coffee-first shop that treats matcha with the same barista care. Great light-filled space to work.' },
  { name: 'Tea Lyfe', city: 'San Jose', area: 'South Bay', price: 1, rating: 4.4,
    styles: ['boba','latte'], vibes: ['Grab and Go','Study or Work'],
    popular: ['Matcha grass jelly latte','Dirty matcha','Taro milk tea'],
    blurb: 'A San Jose boba shop that takes its matcha seriously, with toppings that actually earn their spot.' },
  { name: 'Teaspoon', city: 'Los Altos', area: 'Peninsula', price: 1, rating: 4.2,
    styles: ['boba','latte'], vibes: ['Grab and Go'],
    popular: ['Iced matcha latte','Strawberry matcha','Brown sugar boba'],
    blurb: 'Peninsula-born tea chain with a solid matcha lineup when you want it quick and cold.' },
];

const AREAS = ['Anywhere','San Francisco','East Bay','South Bay','Peninsula'];
const CRAVINGS = [
  { label: 'Anything', value: 'any' },
  { label: 'Matcha latte', value: 'latte' },
  { label: 'Traditional and pure', value: 'pure' },
  { label: 'Dessert and soft serve', value: 'dessert' },
  { label: 'Boba and fruit twists', value: 'boba' },
];
const VIBES = ['Any','Study or Work','Date Spot','Grab and Go'];
const PRICE = p => '$'.repeat(p);

const areaSel = document.getElementById('area');
const cravingSel = document.getElementById('craving');
const vibeSel = document.getElementById('vibe');
areaSel.innerHTML = AREAS.map(a => `<option>${a}</option>`).join('');
cravingSel.innerHTML = CRAVINGS.map(c => `<option value="${c.value}">${c.label}</option>`).join('');
vibeSel.innerHTML = VIBES.map(v => `<option>${v}</option>`).join('');

function stars(r) {
  const full = Math.round(r);
  return '<span class="star">' + '★'.repeat(full) + '</span>' + '☆'.repeat(5 - full);
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

const CRAVING_TEXT = {
  latte: 'a go-to for matcha lattes',
  pure: 'the spot for traditional, properly whisked matcha',
  dessert: 'built for a matcha dessert run',
  boba: 'great when you want your matcha with toppings',
};

function reason(s, area, craving, vibe) {
  const bits = [];
  if (craving !== 'any' && s.styles.includes(craving)) bits.push(CRAVING_TEXT[craving]);
  else bits.push(`a ${s.rating.toFixed(1)}★ local favorite`);
  if (area !== 'Anywhere' && s.area === area) bits.push(`right in the ${s.area === 'San Francisco' ? 'city' : s.area}`);
  if (vibe !== 'Any' && s.vibes.includes(vibe)) bits.push(`fits a ${vibe.toLowerCase()} kind of day`);
  bits.push(`start with the ${s.popular[0].toLowerCase()}`);
  const text = bits.join(', ');
  return text.charAt(0).toUpperCase() + text.slice(1) + '.';
}

function score(s, area, craving, vibe) {
  let sc = s.rating * 2;                                        // quality baseline
  if (craving !== 'any' && s.styles.includes(craving)) sc += 3; // craving match
  if (vibe !== 'Any' && s.vibes.includes(vibe)) sc += 2;        // vibe match
  if (area !== 'Anywhere' && s.area === area) sc += 1;          // local nudge
  sc += (3 - s.price) * 0.2;                                    // slight nudge toward value
  return sc;
}

function find() {
  const area = areaSel.value;
  const craving = cravingSel.value;
  const vibe = vibeSel.value;

  let matches = SPOTS.filter(s =>
    (area === 'Anywhere' || s.area === area) &&
    (craving === 'any' || s.styles.includes(craving)) &&
    (vibe === 'Any' || s.vibes.includes(vibe))
  );
  matches.sort((a, b) => score(b, area, craving, vibe) - score(a, area, craving, vibe));
  matches = matches.slice(0, 5);

  const results = document.getElementById('results');
  if (!matches.length) {
    results.innerHTML = `<p class="empty">No matches for that combination. Try widening the area or picking a different craving.</p>`;
    return;
  }
  results.innerHTML =
    `<p class="count">${matches.length} spot${matches.length > 1 ? 's' : ''} for you</p>` +
    matches.map((s, i) => `
      <article class="rec">
        <div class="rec-top">
          <h3>${escapeHtml(s.name)}</h3>
          <span class="rank">0${i + 1}</span>
        </div>
        <p class="rec-meta">${escapeHtml(s.city)} · ${PRICE(s.price)} · ${stars(s.rating)} ${s.rating.toFixed(1)}</p>
        <p class="rec-blurb">${escapeHtml(s.blurb)}</p>
        <div class="order"><span class="o-label">Order this</span>${s.popular.map(d => `<span class="drink">${escapeHtml(d)}</span>`).join('')}</div>
        <p class="why"><b>Why it fits:</b> ${reason(s, area, craving, vibe)}</p>
      </article>`).join('');
}

document.getElementById('find').addEventListener('click', find);
find(); // show an initial set
