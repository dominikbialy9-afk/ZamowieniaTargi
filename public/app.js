const EURO_RATE = 4.35;
const STORAGE_KEY = 'zt-wizard-state-v1';

const wizardSteps = [
  { id: 'events', label: 'Targi', path: '/app/events' },
  { id: 'halls', label: 'Hala', path: '/app/halls' },
  { id: 'booth', label: 'Stoisko', path: '/app/booth' },
  { id: 'products', label: 'Produkty', path: '/app/products' },
  { id: 'summary', label: 'Podsumowanie', path: '/app/summary' },
];

const events = [
  {
    id: 'forum-bhp-2025',
    name: 'Forum BHP 2025',
    subtitle: 'Bezpieczeństwo pracy na najwyższym poziomie',
    date: '12–14 marca 2025',
    season: 'Wiosna',
    category: 'Industry',
    location: 'Warsaw Expo – Hala F',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'forum-bhp-2024',
    name: 'Forum BHP 2024',
    subtitle: 'Edycja specjalna dla sektora produkcyjnego',
    date: '9–11 kwietnia 2024',
    season: 'Wiosna',
    category: 'Industry',
    location: 'Warsaw Expo – Hala D',
    cover: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'beautydays-2025',
    name: 'Beauty Days 2025',
    subtitle: 'Największe targi branży beauty w Europie Środkowej',
    date: '18–20 czerwca 2025',
    season: 'Lato',
    category: 'Lifestyle',
    location: 'Warsaw Expo – Hala A',
    cover: 'https://images.unsplash.com/photo-1512499617640-c2f999098c01?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'industry-expo-2025',
    name: 'Industry Expo 2025',
    subtitle: 'Automatyzacja i robotyzacja w praktyce',
    date: '2–4 października 2025',
    season: 'Jesień',
    category: 'Industry',
    location: 'Warsaw Expo – Hala E',
    cover: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'cosmopharm-2025',
    name: 'CosmoPharm 2025',
    subtitle: 'Targi farmaceutyczne i medyczne',
    date: '6–8 listopada 2025',
    season: 'Jesień',
    category: 'Healthcare',
    location: 'Warsaw Expo – Hala B',
    cover: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 'fastech-2025',
    name: 'FasTech Expo 2025',
    subtitle: 'Nowoczesne rozwiązania dla e-commerce',
    date: '23–25 stycznia 2025',
    season: 'Zima',
    category: 'E-commerce',
    location: 'Warsaw Expo – Hala C',
    cover: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=640&q=80',
  },
];

const halls = [
  {
    id: 'hala-f-2025',
    eventId: 'forum-bhp-2025',
    name: 'Hala F',
    surface: '12 000 m²',
    storage: 'Magazyn 1',
  },
  {
    id: 'hala-d-2024',
    eventId: 'forum-bhp-2024',
    name: 'Hala D',
    surface: '9 200 m²',
    storage: 'Magazyn 2',
  },
  {
    id: 'hala-a-2025',
    eventId: 'beautydays-2025',
    name: 'Hala A',
    surface: '11 100 m²',
    storage: 'Magazyn 4',
  },
];

const hallBooths = [
  {
    hallId: 'hala-f-2025',
    booths: [
      {
        id: 'f145',
        orderNumber: 'F-145',
        boothNumber: 'B12',
        exhibitor: '3D Phoenix',
        nip: '5252651472',
        status: 'nowe',
        statusDetails: 'W trakcie kompletowania',
        contact: { name: 'Dominik Biały', email: 'dominik.bialy@3dphoenix.pl' },
      },
      {
        id: 'f061',
        orderNumber: 'F-061',
        boothNumber: 'C08',
        exhibitor: 'Habisoft',
        nip: '5260000982',
        status: 'zaakceptowane',
        statusDetails: 'Podpisano umowę',
        contact: { name: 'Anna Cieślak', email: 'anna@habisoft.pl' },
      },
      {
        id: 'f202',
        orderNumber: 'F-202',
        boothNumber: 'D04',
        exhibitor: 'BIKO TECH',
        nip: '5272895401',
        status: 'w-trakcie',
        statusDetails: 'Oczekiwanie na potwierdzenie grafiki',
        contact: { name: 'Marcin Urban', email: 'marcin@biko-tech.pl' },
      },
    ],
  },
  {
    hallId: 'hala-d-2024',
    booths: [
      {
        id: 'd110',
        orderNumber: 'D-110',
        boothNumber: 'A01',
        exhibitor: 'SafeWork',
        nip: '5210084421',
        status: 'nowe',
        statusDetails: 'Oferta wysłana',
        contact: { name: 'Piotr Zieliński', email: 'piotr@safework.pl' },
      },
      {
        id: 'd204',
        orderNumber: 'D-204',
        boothNumber: 'E05',
        exhibitor: 'Better Tools',
        nip: '5249870011',
        status: 'zaakceptowane',
        statusDetails: 'Opłacone',
        contact: { name: 'Agnieszka Milewska', email: 'a.milewska@bt.pl' },
      },
    ],
  },
  {
    hallId: 'hala-a-2025',
    booths: [
      {
        id: 'a010',
        orderNumber: 'A-010',
        boothNumber: 'A05',
        exhibitor: 'Glow Studio',
        nip: '7010039281',
        status: 'nowe',
        statusDetails: 'Czeka na materiały',
        contact: { name: 'Magda Król', email: 'magda@glowstudio.eu' },
      },
      {
        id: 'a055',
        orderNumber: 'A-055',
        boothNumber: 'B08',
        exhibitor: 'BioDerma',
        nip: '5262885011',
        status: 'w-trakcie',
        statusDetails: 'Projektowanie grafiki',
        contact: { name: 'Krzysztof Jabłoński', email: 'k.jablonski@bioderma.pl' },
      },
    ],
  },
];

const products = [
  {
    id: 'prod-ledwall',
    name: 'Ściana LED 3x2m',
    category: 'Multimedia',
    stock: 6,
    image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80',
    priceList: { A: 9800, B: 9200, C: 8800 },
  },
  {
    id: 'prod-chair',
    name: 'Krzesło konferencyjne',
    category: 'Meble',
    stock: 150,
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80',
    priceList: { A: 180, B: 165, C: 150 },
  },
  {
    id: 'prod-counter',
    name: 'Lada HPL z podświetleniem',
    category: 'Meble',
    stock: 24,
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=600&q=80',
    priceList: { A: 2400, B: 2200, C: 1990 },
  },
  {
    id: 'prod-floor',
    name: 'Podłoga winylowa 1m²',
    category: 'Wykończenie',
    stock: 600,
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80',
    priceList: { A: 95, B: 88, C: 82 },
  },
  {
    id: 'prod-spot',
    name: 'Oświetlenie spot 50W',
    category: 'Oświetlenie',
    stock: 80,
    image: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=600&q=80',
    priceList: { A: 210, B: 190, C: 175 },
  },
  {
    id: 'prod-storage',
    name: 'Zaplecze magazynowe 2x2m',
    category: 'Zaplecze',
    stock: 14,
    image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=600&q=80',
    priceList: { A: 1420, B: 1350, C: 1290 },
  },
  {
    id: 'prod-table',
    name: 'Stolik barowy okrągły',
    category: 'Meble',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80',
    priceList: { A: 320, B: 295, C: 275 },
  },
  {
    id: 'prod-cleaning',
    name: 'Serwis porządkowy (dzień)',
    category: 'Serwis',
    stock: 999,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    priceList: { A: 380, B: 360, C: 340 },
  },
];

const previousOrders = [
  { id: 'ZT-101', booth: 'B12', exhibitor: '3D Phoenix', status: 'W trakcie' },
  { id: 'ZT-089', booth: 'C08', exhibitor: 'Habisoft', status: 'Zaakceptowane' },
  { id: 'ZT-076', booth: 'A01', exhibitor: 'SafeWork', status: 'Nowe' },
  { id: 'ZT-055', booth: 'A05', exhibitor: 'Glow Studio', status: 'W trakcie' },
];

let wizardState = loadWizardState();

init();

function loadWizardState() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Nie udało się odczytać stanu', error);
  }
  return {
    eventId: undefined,
    hallId: undefined,
    boothId: undefined,
    currency: 'PLN',
    priceList: 'A',
    cart: {},
    notes: '',
  };
}

function saveWizardState(newState) {
  wizardState = { ...wizardState, ...newState };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(wizardState));
}

async function init() {
  await loadSession();
  renderStepper();
  const page = document.body.dataset.page;
  switch (page) {
    case 'events':
      initEventsPage();
      break;
    case 'halls':
      initHallsPage();
      break;
    case 'booth':
      initBoothPage();
      break;
    case 'products':
      initProductsPage();
      break;
    case 'summary':
      initSummaryPage();
      break;
    default:
      break;
  }
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Brak API sesji, tryb demo?', error);
    }
    window.location.href = '/';
  });
}

async function loadSession() {
  try {
    const response = await fetch('/api/session');
    const data = await response.json();
    const pill = document.getElementById('user-pill');
    if (data.authenticated) {
      pill.textContent = `${data.user.displayName} · ${data.user.role}`;
    } else {
      pill.textContent = 'Gość (tryb podglądu)';
    }
  } catch (error) {
    const pill = document.getElementById('user-pill');
    if (pill) {
      pill.textContent = 'Gość (podgląd offline)';
    }
  }
}

function renderStepper() {
  const container = document.getElementById('wizard-steps');
  if (!container) return;
  const current = document.body.dataset.page;
  container.innerHTML = wizardSteps
    .map((step) => {
      const position = wizardSteps.findIndex((s) => s.id === step.id);
      const currentIndex = wizardSteps.findIndex((s) => s.id === current);
      const status =
        position < currentIndex
          ? 'completed'
          : position === currentIndex
          ? 'active'
          : 'upcoming';
      return `<a href="${step.path}" class="wizard-step ${status}"><span>${step.label}</span></a>`;
    })
    .join('');
}

function initEventsPage() {
  populateEventFilter();
  renderEventsGrid();
  document.getElementById('events-continue').addEventListener('click', () => {
    window.location.href = '/app/halls';
  });
}

function populateEventFilter() {
  const select = document.getElementById('event-category-filter');
  if (!select) return;
  const categories = [...new Set(events.map((event) => event.category))];
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
  select.value = 'all';
  select.addEventListener('change', () => renderEventsGrid(select.value));
}

function renderEventsGrid(filterValue = 'all') {
  const grid = document.getElementById('events-grid');
  if (!grid) return;
  const list = events.filter((event) => filterValue === 'all' || event.category === filterValue);
  grid.innerHTML = list
    .map(
      (event) => `
      <article class="event-card ${wizardState.eventId === event.id ? 'active' : ''}" data-event-id="${event.id}">
        <img src="${event.cover}" alt="${event.name}" loading="lazy" />
        <div class="content">
          <header>
            <h3>${event.name}</h3>
            <p>${event.subtitle}</p>
          </header>
          <dl>
            <div><dt>Data</dt><dd>${event.date}</dd></div>
            <div><dt>Sezon</dt><dd>${event.season}</dd></div>
            <div><dt>Hala</dt><dd>${event.location}</dd></div>
          </dl>
          <button class="primary" type="button">Wybierz</button>
        </div>
      </article>
    `,
    )
    .join('');
  grid.querySelectorAll('.event-card button').forEach((button) => {
    button.addEventListener('click', (event) => {
      const card = event.currentTarget.closest('.event-card');
      const selectedId = card?.dataset.eventId;
      if (!selectedId) return;
      saveWizardState({ eventId: selectedId, hallId: undefined, boothId: undefined, cart: {} });
      renderEventsGrid(filterValue);
      document.getElementById('events-continue').disabled = false;
    });
  });
  document.getElementById('events-continue').disabled = !wizardState.eventId;
}

function initHallsPage() {
  ensureEventSelected();
  renderEventSummary();
  renderHallGrid();
  document.getElementById('hall-continue').addEventListener('click', () => {
    window.location.href = '/app/booth';
  });
}

function renderEventSummary() {
  const container = document.getElementById('event-summary');
  if (!container) return;
  const event = getSelectedEvent();
  container.innerHTML = event
    ? `
    <div>
      <span class="label">Wydarzenie</span>
      <strong>${event.name}</strong>
      <p>${event.date} · ${event.location}</p>
    </div>
  `
    : '';
}

function renderHallGrid() {
  const grid = document.getElementById('hall-grid');
  if (!grid) return;
  const event = getSelectedEvent();
  const list = halls.filter((hall) => hall.eventId === event?.id);
  grid.innerHTML = list
    .map(
      (hall) => `
      <article class="hall-card ${wizardState.hallId === hall.id ? 'active' : ''}" data-hall-id="${hall.id}">
        <header>
          <h3>${hall.name}</h3>
          <p>Powierzchnia ${hall.surface}</p>
        </header>
        <dl>
          <div><dt>Magazyn</dt><dd>${hall.storage}</dd></div>
          <div><dt>ID hali</dt><dd>${hall.id}</dd></div>
        </dl>
        <button class="primary" type="button">Wybierz halę</button>
      </article>
    `,
    )
    .join('');
  grid.querySelectorAll('.hall-card button').forEach((button) => {
    button.addEventListener('click', (event) => {
      const card = event.currentTarget.closest('.hall-card');
      const hallId = card?.dataset.hallId;
      if (!hallId) return;
      saveWizardState({ hallId, boothId: undefined, cart: {} });
      renderHallGrid();
      document.getElementById('hall-continue').disabled = false;
    });
  });
  document.getElementById('hall-continue').disabled = !wizardState.hallId;
}

function initBoothPage() {
  ensureHallSelected();
  renderHallSummary();
  renderBoothTable();
  document.getElementById('booth-search').addEventListener('input', renderBoothTable);
  document.getElementById('booth-status-filter').addEventListener('change', renderBoothTable);
  document.getElementById('booth-continue').addEventListener('click', () => {
    window.location.href = '/app/products';
  });
}

function renderHallSummary() {
  const container = document.getElementById('hall-summary');
  if (!container) return;
  const event = getSelectedEvent();
  const hall = getSelectedHall();
  container.innerHTML = `
    <div>
      <span class="label">Wydarzenie</span>
      <strong>${event?.name ?? '—'}</strong>
      <p>${event?.date ?? ''}</p>
    </div>
    <div>
      <span class="label">Wybrana hala</span>
      <strong>${hall?.name ?? '—'}</strong>
      <p>Magazyn: ${hall?.storage ?? '—'}</p>
    </div>
  `;
}

function renderBoothTable() {
  const tbody = document.getElementById('booth-table');
  if (!tbody) return;
  const hall = getSelectedHall();
  const boothSet = hallBooths.find((entry) => entry.hallId === hall?.id)?.booths ?? [];
  const query = document.getElementById('booth-search').value.toLowerCase();
  const status = document.getElementById('booth-status-filter').value;
  const filtered = boothSet.filter((booth) => {
    const matchesQuery =
      booth.exhibitor.toLowerCase().includes(query) || booth.orderNumber.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || booth.status === status;
    return matchesQuery && matchesStatus;
  });
  tbody.innerHTML = filtered
    .map(
      (booth) => `
      <tr class="booth-row ${wizardState.boothId === booth.id ? 'active' : ''}" data-booth-id="${booth.id}">
        <td><input type="radio" name="booth" ${wizardState.boothId === booth.id ? 'checked' : ''} /></td>
        <td>${booth.orderNumber}</td>
        <td>${booth.boothNumber}</td>
        <td>${booth.exhibitor}</td>
        <td>${booth.nip}</td>
        <td>${formatStatus(booth.status)}</td>
        <td>${booth.contact.name}<br /><a href="mailto:${booth.contact.email}">${booth.contact.email}</a></td>
      </tr>
    `,
    )
    .join('');
  tbody.querySelectorAll('tr').forEach((row) => {
    row.addEventListener('click', () => {
      const boothId = row.dataset.boothId;
      if (!boothId) return;
      saveWizardState({ boothId });
      renderBoothTable();
      document.getElementById('booth-continue').disabled = false;
    });
  });
  document.getElementById('booth-continue').disabled = !wizardState.boothId;
}

function formatStatus(status) {
  switch (status) {
    case 'nowe':
      return 'Nowe';
    case 'w-trakcie':
      return 'W trakcie';
    case 'zaakceptowane':
      return 'Zaakceptowane';
    default:
      return status;
  }
}

function initProductsPage() {
  ensureBoothSelected();
  syncProductControls();
  renderBoothSummary();
  renderProductGrid();
  document.getElementById('currency-select').addEventListener('change', (event) => {
    saveWizardState({ currency: event.target.value });
    renderProductGrid();
  });
  document.getElementById('price-list-select').addEventListener('change', (event) => {
    saveWizardState({ priceList: event.target.value });
    renderProductGrid();
  });
  document.getElementById('product-search').addEventListener('input', renderProductGrid);
  document.getElementById('product-continue').addEventListener('click', () => {
    window.location.href = '/app/summary';
  });
}

function syncProductControls() {
  document.getElementById('currency-select').value = wizardState.currency;
  document.getElementById('price-list-select').value = wizardState.priceList;
}

function renderBoothSummary() {
  const container = document.getElementById('booth-summary');
  if (!container) return;
  const event = getSelectedEvent();
  const hall = getSelectedHall();
  const booth = getSelectedBooth();
  container.innerHTML = `
    <div>
      <span class="label">Targi</span>
      <strong>${event?.name ?? '—'}</strong>
      <p>${hall?.name ?? ''}</p>
    </div>
    <div>
      <span class="label">Stoisko</span>
      <strong>${booth?.boothNumber ?? '—'} (${booth?.orderNumber ?? ''})</strong>
      <p>${booth?.exhibitor ?? ''}</p>
    </div>
    <div>
      <span class="label">Kontakt</span>
      <strong>${booth?.contact.name ?? '—'}</strong>
      <p>${booth?.contact.email ?? ''}</p>
    </div>
  `;
}

function renderProductGrid() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  const query = document.getElementById('product-search').value.toLowerCase();
  const filtered = products.filter(
    (product) => product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query),
  );
  grid.innerHTML = filtered
    .map((product) => {
      const cartItem = wizardState.cart[product.id] ?? { quantity: 0, discount: 0 };
      const price = formatCurrency(applyCurrency(product.priceList[wizardState.priceList], wizardState.currency));
      return `
        <article class="product-card" data-product-id="${product.id}">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <div class="details">
            <h3>${product.name}</h3>
            <p class="category">${product.category}</p>
            <p class="stock">Dostępne: ${product.stock} szt.</p>
            <p class="price">${price}</p>
          </div>
          <div class="controls">
            <label class="field compact">
              <span>Rabat %</span>
              <input type="number" min="0" max="90" step="1" value="${cartItem.discount ?? 0}" class="discount-input" />
            </label>
            <div class="quantity">
              <button type="button" class="icon-button" data-action="decrease">−</button>
              <input type="number" min="0" step="1" value="${cartItem.quantity ?? 0}" class="qty-input" />
              <button type="button" class="icon-button" data-action="increase">+</button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
  grid.querySelectorAll('.product-card').forEach((card) => {
    const productId = card.dataset.productId;
    const qtyInput = card.querySelector('.qty-input');
    const discountInput = card.querySelector('.discount-input');
    card.querySelector('[data-action="decrease"]').addEventListener('click', () => {
      updateCart(productId, Math.max(0, Number(qtyInput.value) - 1), Number(discountInput.value));
    });
    card.querySelector('[data-action="increase"]').addEventListener('click', () => {
      updateCart(productId, Number(qtyInput.value) + 1, Number(discountInput.value));
    });
    qtyInput.addEventListener('change', () => {
      updateCart(productId, Number(qtyInput.value), Number(discountInput.value));
    });
    discountInput.addEventListener('change', () => {
      updateCart(productId, Number(qtyInput.value), Number(discountInput.value));
    });
  });
}

function updateCart(productId, quantity, discount) {
  const nextCart = { ...wizardState.cart };
  if (quantity <= 0) {
    delete nextCart[productId];
  } else {
    nextCart[productId] = { quantity, discount: Math.max(0, Math.min(90, discount || 0)) };
  }
  saveWizardState({ cart: nextCart });
  if (document.body.dataset.page === 'products') {
    renderProductGrid();
  }
}

function initSummaryPage() {
  ensureBoothSelected();
  renderSummarySelection();
  renderOrderPreview();
  renderOrdersTable();
  const notesField = document.getElementById('order-notes');
  notesField.value = wizardState.notes ?? '';
  notesField.addEventListener('input', () => {
    saveWizardState({ notes: notesField.value });
  });
  document.getElementById('pdf-btn').addEventListener('click', () => {
    alert('Generator PDF zostanie dodany po zaakceptowaniu wzoru.');
  });
  document.getElementById('save-order').addEventListener('click', () => {
    alert('Zapisano roboczą wersję zamówienia.');
  });
}

function renderSummarySelection() {
  const container = document.getElementById('summary-selection');
  if (!container) return;
  const event = getSelectedEvent();
  const hall = getSelectedHall();
  const booth = getSelectedBooth();
  container.innerHTML = `
    <div>
      <span class="label">Targi</span>
      <strong>${event?.name ?? '—'}</strong>
      <p>${event?.date ?? ''}</p>
    </div>
    <div>
      <span class="label">Hala</span>
      <strong>${hall?.name ?? '—'}</strong>
      <p>${hall?.storage ?? ''}</p>
    </div>
    <div>
      <span class="label">Stoisko</span>
      <strong>${booth?.boothNumber ?? '—'} (${booth?.orderNumber ?? ''})</strong>
      <p>${booth?.exhibitor ?? ''}</p>
    </div>
    <div>
      <span class="label">Kontakt</span>
      <strong>${booth?.contact.name ?? '—'}</strong>
      <p>${booth?.contact.email ?? ''}</p>
    </div>
  `;
}

function renderOrderPreview() {
  const tbody = document.getElementById('order-preview-body');
  const totalsBox = document.getElementById('order-totals');
  const currencyBadge = document.getElementById('order-currency');
  if (!tbody || !totalsBox) return;
  const lines = Object.entries(wizardState.cart).map(([productId, info]) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return undefined;
    const basePrice = product.priceList[wizardState.priceList];
    const discounted = basePrice * (1 - (info.discount ?? 0) / 100);
    const converted = applyCurrency(discounted, wizardState.currency);
    const lineTotal = converted * info.quantity;
    return {
      product,
      quantity: info.quantity,
      discount: info.discount ?? 0,
      unitPrice: converted,
      lineTotal,
    };
  });
  const validLines = lines.filter(Boolean);
  if (validLines.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">Dodaj produkty w poprzednim kroku.</td></tr>';
    totalsBox.textContent = '';
  } else {
    tbody.innerHTML = validLines
      .map(
        (line) => `
        <tr>
          <td>${line.product.name}</td>
          <td>${line.quantity}</td>
          <td>${line.discount}%</td>
          <td>${formatCurrency(line.unitPrice)}</td>
          <td>${formatCurrency(line.lineTotal)}</td>
        </tr>
      `,
      )
      .join('');
    const total = validLines.reduce((sum, line) => sum + line.lineTotal, 0);
    totalsBox.innerHTML = `
      <div><span>Razem netto</span><strong>${formatCurrency(total)}</strong></div>
      <div><span>VAT 23%</span><strong>${formatCurrency(total * 0.23)}</strong></div>
      <div class="grand-total"><span>Razem brutto</span><strong>${formatCurrency(total * 1.23)}</strong></div>
    `;
  }
  if (currencyBadge) {
    currencyBadge.textContent = `Cennik ${wizardState.priceList} · ${wizardState.currency}`;
  }
}

function renderOrdersTable() {
  const tbody = document.getElementById('orders-table');
  if (!tbody) return;
  tbody.innerHTML = previousOrders
    .map(
      (order) => `
      <tr>
        <td>${order.id}</td>
        <td>${order.booth}</td>
        <td>${order.exhibitor}</td>
        <td>${order.status}</td>
      </tr>
    `,
    )
    .join('');
}

function ensureEventSelected() {
  if (!wizardState.eventId) {
    window.location.href = '/app/events';
  }
}

function ensureHallSelected() {
  ensureEventSelected();
  if (!wizardState.hallId) {
    window.location.href = '/app/halls';
  }
}

function ensureBoothSelected() {
  ensureHallSelected();
  if (!wizardState.boothId) {
    window.location.href = '/app/booth';
  }
}

function getSelectedEvent() {
  return events.find((event) => event.id === wizardState.eventId);
}

function getSelectedHall() {
  return halls.find((hall) => hall.id === wizardState.hallId);
}

function getSelectedBooth() {
  const hallId = wizardState.hallId;
  const hall = hallBooths.find((entry) => entry.hallId === hallId);
  return hall?.booths.find((booth) => booth.id === wizardState.boothId);
}

function applyCurrency(price, currency) {
  return currency === 'EUR' ? price / EURO_RATE : price;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: wizardState.currency === 'EUR' ? 'EUR' : 'PLN',
    minimumFractionDigits: 2,
  }).format(value);
}
