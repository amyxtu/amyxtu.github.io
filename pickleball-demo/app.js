// Curated Bay Area outdoor pickleball spots: sample data for the demo.
// type: 'Dedicated' (pickleball-only courts) or 'Lined' (shared lines on tennis)
const SPOTS = [
  { name: 'Ortega Park', city: 'Sunnyvale', area: 'South Bay', courts: 12, type: 'Dedicated', lights: true,
    scene: ['Social drop-in', 'Competitive'],
    blurb: 'The South Bay pickleball hub. Expect a paddle stack and a lively rotation most days.' },
  { name: 'Mitchell Park', city: 'Palo Alto', area: 'Peninsula', courts: 6, type: 'Dedicated', lights: false,
    scene: ['Social drop-in', 'Beginner friendly'],
    blurb: 'Friendly morning regulars and a welcoming open-play culture near the library.' },
  { name: 'Almaden Lake Park', city: 'San Jose', area: 'South Bay', courts: 8, type: 'Dedicated', lights: false,
    scene: ['Social drop-in', 'Beginner friendly'],
    blurb: 'Lakeside courts with room to warm up. A relaxed alternative to the busier hubs.' },
  { name: 'Memorial Park', city: 'Cupertino', area: 'South Bay', courts: 8, type: 'Dedicated', lights: false,
    scene: ['Social drop-in', 'Competitive'],
    blurb: 'Cupertino\'s go-to spot, with steady weekend crowds and solid intermediate play.' },
  { name: 'Las Palmas Park', city: 'Sunnyvale', area: 'South Bay', courts: 8, type: 'Dedicated', lights: true,
    scene: ['Competitive', 'Social drop-in'],
    blurb: 'Part of the tennis center, so the courts and upkeep are dependably good.' },
  { name: 'Presidio Wall Playground', city: 'San Francisco', area: 'San Francisco', courts: 4, type: 'Lined', lights: false,
    scene: ['Social drop-in', 'Competitive'],
    blurb: 'The city\'s liveliest drop-in scene. Come early on weekends if you want a court.' },
  { name: 'Louis Sutter Playground', city: 'San Francisco', area: 'San Francisco', courts: 6, type: 'Dedicated', lights: true,
    scene: ['Social drop-in', 'Beginner friendly'],
    blurb: 'Dedicated courts up in McLaren Park, and one of the better bets for evening games.' },
  { name: 'Bushrod Park', city: 'Oakland', area: 'East Bay', courts: 4, type: 'Lined', lights: false,
    scene: ['Social drop-in', 'Beginner friendly'],
    blurb: 'North Oakland pickup games with a neighborhood feel. Bring a paddle, find a four.' },
  { name: 'Washington Park', city: 'Alameda', area: 'East Bay', courts: 4, type: 'Lined', lights: false,
    scene: ['Beginner friendly', 'Social drop-in'],
    blurb: 'Easygoing island courts a short ride from the beach, rarely oversubscribed.' },
  { name: 'Rengstorff Park', city: 'Mountain View', area: 'Peninsula', courts: 4, type: 'Lined', lights: false,
    scene: ['Social drop-in'],
    blurb: 'Convenient mid-Peninsula option when the dedicated complexes are packed.' },
];

const AREAS = ['Anywhere','San Francisco','East Bay','South Bay','Peninsula'];

const areaSel = document.getElementById('area');
areaSel.innerHTML = AREAS.map(a => `<option>${a}</option>`).join('');

// Header stats
document.getElementById('stat-parks').textContent = SPOTS.length;
document.getElementById('stat-courts').textContent = SPOTS.reduce((n, s) => n + s.courts, 0);
document.getElementById('stat-lit').textContent = SPOTS.filter(s => s.lights).length;

function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function reason(s, area, type, when) {
  const bits = [];
  if (s.type === 'Dedicated') bits.push(`${s.courts} dedicated courts, no tennis timeshare`);
  else bits.push(`${s.courts} lined courts you can usually walk onto`);
  if (when === 'evening' && s.lights) bits.push('lit for evening play');
  if (area !== 'Anywhere' && s.area === area) bits.push(`right in the ${s.area === 'San Francisco' ? 'city' : s.area}`);
  bits.push(s.scene[0].toLowerCase() + ' scene');
  const text = bits.join(', ');
  return text.charAt(0).toUpperCase() + text.slice(1) + '.';
}

function score(s, area, type, when) {
  let sc = s.courts * 0.6;                                  // more courts, less waiting
  if (s.type === 'Dedicated') sc += 3;                      // dedicated beats lined
  if (type !== 'any' && s.type === type) sc += 2;           // explicit type match
  if (when === 'evening' && s.lights) sc += 3;              // lights matter at night
  if (area !== 'Anywhere' && s.area === area) sc += 1;      // local nudge
  return sc;
}

function find() {
  const area = areaSel.value;
  const type = document.getElementById('type').value;
  const when = document.getElementById('when').value;

  let matches = SPOTS.filter(s =>
    (area === 'Anywhere' || s.area === area) &&
    (type === 'any' || s.type === type) &&
    (when !== 'evening' || s.lights)
  );
  matches.sort((a, b) => score(b, area, type, when) - score(a, area, type, when));
  matches = matches.slice(0, 5);

  const results = document.getElementById('results');
  if (!matches.length) {
    results.innerHTML = `<p class="empty">No matches for that combination. Evening play with lights is the tightest filter, try widening the area.</p>`;
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
        <p class="rec-meta">${escapeHtml(s.city)} · ${s.area}</p>
        <p class="rec-blurb">${escapeHtml(s.blurb)}</p>
        <div class="facts">
          <span class="big">${s.courts} courts</span>
          <span>${s.type === 'Dedicated' ? 'Dedicated pickleball' : 'Lined on tennis'}</span>
          <span>${s.lights ? 'Lights for evening play' : 'Daylight hours'}</span>
          ${s.scene.map(t => `<span>${escapeHtml(t)}</span>`).join('')}
        </div>
        <p class="why"><b>Why it fits:</b> ${reason(s, area, type, when)}</p>
      </article>`).join('');
}

document.getElementById('find').addEventListener('click', find);
find(); // show an initial set
