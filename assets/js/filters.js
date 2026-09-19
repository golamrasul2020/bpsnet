/* ==========================================================================
   BPS FILTERS.JS — JSON data rendering + search/filter for dynamic sections
   ========================================================================== */
(function () {
  "use strict";
  const ROOT = document.documentElement.getAttribute('data-root') || './';

  function fetchJSON(file) {
    return fetch(ROOT + 'assets/data/' + file).then((r) => r.json());
  }
  window.BPS = window.BPS || {};
  window.BPS.fetchJSON = fetchJSON;
  window.BPS.ROOT = ROOT;

  /* ---------------- DISEASE DATABASE ---------------- */
  function badgeClass(type) {
    const map = { Fungal: 'badge-type-fungal', Bacterial: 'badge-type-bacterial', Viral: 'badge-type-viral', Oomycete: 'badge-type-oomycete' };
    return map[type] || 'badge-soft';
  }

  function renderDiseases(list) {
    const grid = document.getElementById('diseaseGrid');
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = '<div class="col-12 text-center text-muted py-5"><i class="bi bi-search fs-1 d-block mb-2"></i>No diseases match your search.</div>';
      return;
    }
    grid.innerHTML = list.map((d) => `
      <div class="col-lg-4 col-md-6 reveal">
        <div class="card-base disease-card">
          <img src="${ROOT}assets/images/diseases/${d.id}.webp" alt="${d.diseaseName} on ${d.crop}" class="img-cover" loading="lazy">
          <div class="card-body-pad">
            <span class="badge-soft mb-2 d-inline-block">${d.crop}</span>
            <h5>${d.diseaseName}</h5>
            <span class="sci-name">${d.scientificName}</span>
            <div class="disease-meta">
              <span class="badge-soft ${badgeClass(d.pathogenType)}">${d.pathogenType}</span>
              <span class="badge-soft"><i class="bi bi-geo-alt"></i> ${d.region}</span>
            </div>
            <p class="text-muted small mb-3">${d.symptoms}</p>
            <button class="btn btn-sm btn-primary-c w-100" data-bs-toggle="modal" data-bs-target="#diseaseModal" data-disease-id="${d.id}">
              Learn More <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>`).join('');
    document.dispatchEvent(new CustomEvent('bps:contentRendered'));
  }

  function initDiseaseDatabase() {
    const grid = document.getElementById('diseaseGrid');
    if (!grid) return;
    fetchJSON('diseases.json').then((data) => {
      window.__diseaseData = data;
      populateCropFilter(data);
      applyDiseaseFilters();
    });

    const searchInput = document.getElementById('diseaseSearch');
    const cropFilter = document.getElementById('cropFilter');
    const typeFilter = document.getElementById('typeFilter');
    [searchInput, cropFilter, typeFilter].forEach((el) => el && el.addEventListener('input', applyDiseaseFilters));

    // Pre-select type from URL query (?type=Fungal)
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') && typeFilter) {
      document.addEventListener('bps:dataReady', () => { typeFilter.value = params.get('type'); applyDiseaseFilters(); }, { once: true });
    }

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-disease-id]');
      if (!btn) return;
      const d = (window.__diseaseData || []).find((x) => x.id === btn.getAttribute('data-disease-id'));
      if (d) fillDiseaseModal(d);
    });
  }

  function populateCropFilter(data) {
    const cropFilter = document.getElementById('cropFilter');
    if (!cropFilter) return;
    const crops = [...new Set(data.map((d) => d.crop))].sort();
    crops.forEach((c) => cropFilter.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`));
    document.dispatchEvent(new CustomEvent('bps:dataReady'));
  }

  function applyDiseaseFilters() {
    const data = window.__diseaseData || [];
    const q = (document.getElementById('diseaseSearch')?.value || '').toLowerCase();
    const crop = document.getElementById('cropFilter')?.value || '';
    const type = document.getElementById('typeFilter')?.value || '';
    const filtered = data.filter((d) => {
      const matchQ = !q || d.diseaseName.toLowerCase().includes(q) || d.crop.toLowerCase().includes(q) || d.scientificName.toLowerCase().includes(q);
      const matchCrop = !crop || d.crop === crop;
      const matchType = !type || d.pathogenType === type;
      return matchQ && matchCrop && matchType;
    });
    renderDiseases(filtered);
  }

  function fillDiseaseModal(d) {
    document.getElementById('diseaseModalLabel').textContent = d.diseaseName;
    document.getElementById('diseaseModalBody').innerHTML = `
      <img src="${ROOT}assets/images/diseases/${d.id}.webp" class="img-cover rounded mb-3" style="height:240px" alt="${d.diseaseName}">
      <p><strong>Crop:</strong> ${d.crop} &nbsp;|&nbsp; <strong>Pathogen Type:</strong> ${d.pathogenType}</p>
      <p><strong>Scientific Name:</strong> <em>${d.scientificName}</em></p>
      <p><strong>Region:</strong> ${d.region}</p>
      <hr>
      <p><strong><i class="bi bi-clipboard2-pulse text-primary-c"></i> Symptoms:</strong> ${d.symptoms}</p>
      <p><strong><i class="bi bi-bug text-primary-c"></i> Cause:</strong> ${d.cause}</p>
      <p><strong><i class="bi bi-shield-check text-primary-c"></i> Management:</strong> ${d.management}</p>
      <p><strong><i class="bi bi-umbrella text-primary-c"></i> Prevention:</strong> ${d.prevention}</p>`;
  }

  /* ---------------- EVENTS ---------------- */
  function renderEvents(list, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = list.map((ev) => `
      <div class="col-lg-4 col-md-6 reveal">
        <div class="card-base event-card">
          <div class="position-relative">
            <img src="${ROOT}assets/images/events/event-${ev.id}.webp" class="img-cover" alt="${ev.title}" loading="lazy">
            <div class="event-date-badge"><i class="bi bi-calendar-event"></i><br>${ev.date}</div>
          </div>
          <div class="card-body-pad">
            <span class="badge-soft mb-2 d-inline-block">${ev.type}</span>
            <h5>${ev.title}</h5>
            <p class="text-muted small"><i class="bi bi-geo-alt"></i> ${ev.location}</p>
            <p class="text-muted small">${ev.description}</p>
            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-sm btn-primary-c w-100" data-bs-toggle="modal" data-bs-target="#eventModal" data-event-id="${ev.id}">Details</button>
              ${ev.status === 'upcoming' ? '<a href="#" class="btn btn-sm btn-outline-primary w-100">Register</a>' : ''}
            </div>
          </div>
        </div>
      </div>`).join('');
    document.dispatchEvent(new CustomEvent('bps:contentRendered'));
  }

  function initEvents() {
    const upcoming = document.getElementById('upcomingEventsGrid');
    const past = document.getElementById('pastEventsGrid');
    const home = document.getElementById('homeEventsGrid');
    if (!upcoming && !past && !home) return;
    fetchJSON('events.json').then((data) => {
      window.__eventData = data;
      if (home) renderEvents(data.filter((e) => e.status === 'upcoming').slice(0, 3), 'homeEventsGrid');
      if (upcoming) renderEvents(data.filter((e) => e.status === 'upcoming'), 'upcomingEventsGrid');
      if (past) renderEvents(data.filter((e) => e.status === 'past'), 'pastEventsGrid');
    });
    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-event-id]');
      if (!btn) return;
      const ev = (window.__eventData || []).find((x) => x.id == btn.getAttribute('data-event-id'));
      if (ev && document.getElementById('eventModalLabel')) {
        document.getElementById('eventModalLabel').textContent = ev.title;
        document.getElementById('eventModalBody').innerHTML = `
          <img src="${ROOT}assets/images/events/event-${ev.id}.webp" class="img-cover rounded mb-3" style="height:220px" alt="${ev.title}">
          <p><strong>Type:</strong> ${ev.type}</p>
          <p><strong>Date:</strong> ${ev.date}</p>
          <p><strong>Location:</strong> ${ev.location}</p>
          <p>${ev.description}</p>
          <div class="notice-demo"><i class="bi bi-info-circle"></i> Sample/demo event data — to be updated by BPS Administration.</div>`;
      }
    });
  }

  /* ---------------- NEWS ---------------- */
  function renderNews(list, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = list.map((n) => `
      <div class="col-lg-4 col-md-6 reveal">
        <div class="card-base news-card">
          <img src="${ROOT}assets/images/news/news-${n.id}.webp" class="img-cover" alt="${n.title}" loading="lazy">
          <div class="card-body-pad">
            <div class="news-meta"><span class="badge-soft">${n.category}</span><span>${n.date}</span></div>
            <h5>${n.title}</h5>
            <p class="text-muted small">${n.excerpt}</p>
            <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#newsModal" data-news-id="${n.id}">Read More <i class="bi bi-arrow-right"></i></button>
          </div>
        </div>
      </div>`).join('');
    document.dispatchEvent(new CustomEvent('bps:contentRendered'));
  }

  function initNews() {
    const home = document.getElementById('homeNewsGrid');
    const all = document.getElementById('newsGrid');
    if (!home && !all) return;
    fetchJSON('news.json').then((data) => {
      window.__newsData = data;
      if (home) renderNews(data.slice(0, 3), 'homeNewsGrid');
      if (all) renderNews(data, 'newsGrid');
    });
    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-news-id]');
      if (!btn) return;
      const n = (window.__newsData || []).find((x) => x.id == btn.getAttribute('data-news-id'));
      if (n && document.getElementById('newsModalLabel')) {
        document.getElementById('newsModalLabel').textContent = n.title;
        document.getElementById('newsModalBody').innerHTML = `
          <img src="${ROOT}assets/images/news/news-${n.id}.webp" class="img-cover rounded mb-3" style="height:220px" alt="${n.title}">
          <div class="news-meta mb-2"><span class="badge-soft">${n.category}</span><span>${n.date}</span></div>
          <p>${n.excerpt}</p><p>${n.content}</p>`;
      }
    });
  }

  /* ---------------- PUBLICATIONS ---------------- */
  function renderPublications(list) {
    const el = document.getElementById('publicationsGrid');
    if (!el) return;
    if (!list.length) { el.innerHTML = '<p class="text-center text-muted py-5">No publications found.</p>'; return; }
    el.innerHTML = list.map((p) => `
      <div class="col-lg-6 reveal">
        <div class="pub-card">
          <div class="pub-icon"><i class="bi bi-file-earmark-pdf-fill"></i></div>
          <div>
            <span class="badge-soft mb-2 d-inline-block">${p.type} · ${p.year}</span>
            <h6 class="mb-1">${p.title}</h6>
            <p class="text-muted small mb-2">${p.author}</p>
            <a href="#" class="btn btn-sm btn-outline-primary"><i class="bi bi-download"></i> Download PDF</a>
          </div>
        </div>
      </div>`).join('');
    document.dispatchEvent(new CustomEvent('bps:contentRendered'));
  }

  function initPublications() {
    const el = document.getElementById('publicationsGrid');
    if (!el) return;
    fetchJSON('publications.json').then((data) => {
      window.__pubData = data;
      renderPublications(data);
    });
    const search = document.getElementById('pubSearch');
    const year = document.getElementById('pubYear');
    const type = document.getElementById('pubType');
    [search, year, type].forEach((i) => i && i.addEventListener('input', () => {
      const q = (search?.value || '').toLowerCase();
      const y = year?.value || '';
      const t = type?.value || '';
      const filtered = (window.__pubData || []).filter((p) =>
        (!q || p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q)) &&
        (!y || p.year === y) && (!t || p.type === t));
      renderPublications(filtered);
    }));
  }

  /* ---------------- COMMITTEE ---------------- */
  function renderCommittee(list) {
    const el = document.getElementById('committeeGrid');
    if (!el) return;
    el.innerHTML = list.map((m) => `
      <div class="col-lg-3 col-md-4 col-sm-6 reveal">
        <div class="card-base committee-card">
          <img src="${ROOT}assets/images/committee/member-${m.id}.webp" class="committee-photo" alt="${m.position}" loading="lazy">
          <h5>${m.name}</h5>
          <span class="committee-position">${m.position}</span>
          <span class="committee-institution">${m.institution}</span>
        </div>
      </div>`).join('');
    document.dispatchEvent(new CustomEvent('bps:contentRendered'));
  }

  function initCommittee() {
    const el = document.getElementById('committeeGrid');
    if (!el) return;
    fetchJSON('committee.json').then((data) => renderCommittee(data));
  }

  /* ---------------- GALLERY FILTER (static markup) ---------------- */
  function initGalleryFilter() {
    const buttons = document.querySelectorAll('.gallery-filters .filter-btn');
    const items = document.querySelectorAll('.gallery-item');
    if (!buttons.length) return;
    buttons.forEach((btn) => btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      items.forEach((item) => {
        const show = cat === 'all' || item.getAttribute('data-category') === cat;
        item.parentElement.style.display = show ? '' : 'none';
      });
    }));
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDiseaseDatabase();
    initEvents();
    initNews();
    initPublications();
    initCommittee();
    initGalleryFilter();
  });
})();