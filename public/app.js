const EURO_RATE = 4.35;

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
    id: 'hala-d-2024',
    eventId: 'forum-bhp-2024',
    name: 'Hala D',
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
    id: 'hala-a-2025',
    eventId: 'beautydays-2025',
    name: 'Hala A',
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
  { id: 'ZT-101', booth: 'B12', exhibitor: '3D Phoenix', nip: '5252651472', status: 'W trakcie' },
  { id: 'ZT-089', booth: 'C08', exhibitor: 'Habisoft', nip: '5260000982', status: 'Zaakceptowane' },
  { id: 'ZT-076', booth: 'A01', exhibitor: 'SafeWork', nip: '5210084421', status: 'Nowe' },
  { id: 'ZT-055', booth: 'A05', exhibitor: 'Glow Studio', nip: '7010039281', status: 'W trakcie' },
];

const state = {
  selectedEventId: events[0].id,
  selectedHallId: halls[0].id,
  selectedBoothId: halls[0].booths[0].id,
  priceList: 'A',
  currency: 'PLN',
  productSearch: '',
  cart: {},
  exhibitor: {
    name: halls[0].booths[0].exhibitor,
    nip: halls[0].booths[0].nip,
    contact: halls[0].booths[0].contact.name,
    email: halls[0].booths[0].contact.email,
  },
  filters: {
    company: '',
    nip: '',
    order: '',
    status: 'all',
  },
};

init();

async function init() {
  await loadSession();
  bindTabNavigation();
  bindInputs();
  populateEventCategories();
  renderAll();
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
    console.error('Session error', error);
  }
}

function bindTabNavigation() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((btn) => btn.classList.toggle('active', btn === tab));
      document
        .querySelectorAll('.panel')
        .forEach((panel) => panel.classList.toggle('hidden', panel.dataset.panel !== tab.dataset.tab));
    });
  });
}

function bindInputs() {
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.reload();
  });

  document.getElementById('currency-select').addEventListener('change', (event) => {
    state.currency = event.target.value;
    renderPrices();
  });

  document.getElementById('price-list-select').addEventListener('change', (event) => {
    state.priceList = event.target.value;
    renderPrices();
  });

  document.getElementById('product-search').addEventListener('input', (event) => {
    state.productSearch = event.target.value.toLowerCase();
    renderProductGrid();
  });

  document.getElementById('filter-btn').addEventListener('click', () => {
    state.filters = {
      company: document.getElementById('filter-company').value.toLowerCase(),
      nip: document.getElementById('filter-nip').value.toLowerCase(),
      order: document.getElementById('filter-order').value.toLowerCase(),
      status: document.getElementById('filter-status').value,
    };
    renderBooths();
    renderOrdersTable();
  });

  document.getElementById('hall-select').addEventListener('change', (event) => {
    state.selectedHallId = event.target.value;
    const hall = getSelectedHall();
    if (hall && hall.booths.length > 0) {
      selectBooth(hall.booths[0].id);
    }
    renderBooths();
  });

  document.getElementById('download-offer').addEventListener('click', () => {
    alert('Generator PDF zostanie podpięty w kolejnej iteracji.');
  });

  document.getElementById('save-order').addEventListener('click', () => {
    alert('Zapisano robocze zamówienie.');
  });

  document.getElementById('reset-order').addEventListener('click', () => {
    state.cart = {};
    renderPrices();
  });

  document.getElementById('refresh-orders').addEventListener('click', () => {
    renderOrdersTable(true);
  });

  ['exhibitor-name', 'exhibitor-nip', 'exhibitor-contact', 'exhibitor-email'].forEach((id) => {
    document.getElementById(id).addEventListener('input', (event) => {
      state.exhibitor = {
        ...state.exhibitor,
        name: document.getElementById('exhibitor-name').value,
        nip: document.getElementById('exhibitor-nip').value,
        contact: document.getElementById('exhibitor-contact').value,
        email: document.getElementById('exhibitor-email').value,
      };
      renderExhibitorCard();
    });
  });
}

function populateEventCategories() {
  const select = document.getElementById('event-category-filter');
  const categories = [...new Set(events.map((event) => event.category))];
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
  select.addEventListener('change', () => {
    renderEventsGrid(select.value);
  });
}

function renderAll() {
  renderEventsGrid();
  renderHallSelect();
  renderBooths();
  renderProductGrid();
  renderOrdersTable();
  renderExhibitorCard();
  syncExhibitorForm();
  renderCartTable();
  renderSummaryTable();
}

function renderEventsGrid(filterValue = getEventFilterValue()) {
  const grid = document.getElementById('events-grid');
  const items = events.filter((event) => filterValue === 'all' || event.category === filterValue);
  grid.innerHTML = items
    .map(
      (event) => `
        <article class="event-card ${state.selectedEventId === event.id ? 'active' : ''}" data-event-id="${event.id}">
          <img src="${event.cover}" alt="${event.name}" loading="lazy" />
          <div class="content">
            <h3>${event.name}</h3>
            <p>${event.subtitle}</p>
            <small>${event.date} • ${event.location}</small>
          </div>
        </article>
      `,
    )
    .join('');

  grid.querySelectorAll('.event-card').forEach((card) => {
    card.addEventListener('click', () => {
      const eventId = card.getAttribute('data-event-id');
      state.selectedEventId = eventId;
      const hallForEvent = halls.find((hall) => hall.eventId === eventId);
      if (hallForEvent) {
        state.selectedHallId = hallForEvent.id;
        if (hallForEvent.booths.length > 0) {
          selectBooth(hallForEvent.booths[0].id);
        }
      }
      renderHallSelect();
      renderEventsGrid(filterValue);
      renderBooths();
    });
  });
}

function getEventFilterValue() {
  return document.getElementById('event-category-filter').value || 'all';
}

function renderHallSelect() {
  const hallSelect = document.getElementById('hall-select');
  const eventHalls = halls.filter((hall) => hall.eventId === state.selectedEventId);
  hallSelect.innerHTML = eventHalls
    .map((hall) => `<option value="${hall.id}" ${hall.id === state.selectedHallId ? 'selected' : ''}>${hall.name}</option>`)
    .join('');
  if (!eventHalls.some((hall) => hall.id === state.selectedHallId) && eventHalls.length > 0) {
    state.selectedHallId = eventHalls[0].id;
  }
}

function renderBooths() {
  const hall = getSelectedHall();
  const tbody = document.getElementById('booth-table');
  if (!hall) {
    tbody.innerHTML = '<tr><td colspan="6">Brak stoisk dla tej hali.</td></tr>';
    return;
  }
  const filtered = hall.booths.filter(matchesFilters);
  tbody.innerHTML = filtered
    .map(
      (booth) => `
        <tr class="booth-row ${booth.id === state.selectedBoothId ? 'active' : ''}" data-booth-id="${booth.id}">
          <td>${booth.orderNumber}</td>
          <td>${booth.boothNumber}</td>
          <td>${booth.exhibitor}</td>
          <td>${booth.nip}</td>
          <td>${translateStatus(booth.status)}</td>
          <td>${booth.contact.name}<br/><small>${booth.contact.email}</small></td>
        </tr>
      `,
    )
    .join('');

  tbody.querySelectorAll('.booth-row').forEach((row) => {
    row.addEventListener('click', () => {
      const boothId = row.getAttribute('data-booth-id');
      selectBooth(boothId);
      renderBooths();
    });
  });
}

function matchesFilters(booth) {
  const { company, nip, order, status } = state.filters;
  const matchesCompany = !company || booth.exhibitor.toLowerCase().includes(company);
  const matchesNip = !nip || booth.nip.toLowerCase().includes(nip);
  const matchesOrder = !order || booth.orderNumber.toLowerCase().includes(order);
  const matchesStatus = status === 'all' || booth.status === status;
  return matchesCompany && matchesNip && matchesOrder && matchesStatus;
}

function selectBooth(boothId) {
  state.selectedBoothId = boothId;
  const hall = getSelectedHall();
  const booth = hall?.booths.find((item) => item.id === boothId);
  if (booth) {
    state.exhibitor = {
      name: booth.exhibitor,
      nip: booth.nip,
      contact: booth.contact.name,
      email: booth.contact.email,
    };
    syncExhibitorForm();
    renderExhibitorCard();
  }
}

function renderProductGrid() {
  const grid = document.getElementById('product-grid');
  const search = state.productSearch;
  const filteredProducts = products.filter(
    (product) =>
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search),
  );
  grid.innerHTML = filteredProducts
    .map(
      (product) => `
        <article class="product-card" data-product-id="${product.id}">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <div>
            <h3>${product.name}</h3>
            <p>${product.category} • Dostępne: ${product.stock}</p>
          </div>
          <footer>
            <strong>${formatPrice(product.priceList[state.priceList])}</strong>
            <div class="quantity-input" data-product-id="${product.id}">
              <button type="button" data-action="minus">−</button>
              <span>${state.cart[product.id] ?? 0}</span>
              <button type="button" data-action="plus">+</button>
            </div>
          </footer>
        </article>
      `,
    )
    .join('');

  grid.querySelectorAll('.quantity-input button').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.parentElement.getAttribute('data-product-id');
      const delta = button.dataset.action === 'plus' ? 1 : -1;
      updateCart(productId, delta);
    });
  });
}

function updateCart(productId, delta) {
  const current = state.cart[productId] ?? 0;
  const nextValue = Math.max(0, current + delta);
  if (nextValue === 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = nextValue;
  }
  renderPrices();
}

function renderPrices() {
  renderProductGrid();
  renderCartTable();
  renderSummaryTable();
  renderExhibitorCard();
}

function renderCartTable() {
  const tbody = document.getElementById('cart-table');
  const entries = Object.entries(state.cart);
  if (entries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">Brak produktów</td></tr>';
    return;
  }
  tbody.innerHTML = entries
    .map(([productId, quantity]) => {
      const product = products.find((item) => item.id === productId);
      if (!product) return '';
      const price = product.priceList[state.priceList];
      return `
        <tr>
          <td>${product.name}</td>
          <td>${quantity} szt.</td>
          <td>${formatPrice(price)}</td>
        </tr>
      `;
    })
    .join('');
}

function renderSummaryTable() {
  const tbody = document.getElementById('summary-lines');
  const entries = Object.entries(state.cart);
  if (entries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">Dodaj produkty, aby zobaczyć podsumowanie.</td></tr>';
    document.getElementById('summary-total').textContent = `0 ${state.currency}`;
    return;
  }
  let total = 0;
  tbody.innerHTML = entries
    .map(([productId, quantity]) => {
      const product = products.find((item) => item.id === productId);
      if (!product) return '';
      const price = product.priceList[state.priceList];
      const value = price * quantity;
      total += value;
      return `
        <tr>
          <td>${product.name}</td>
          <td>${quantity}</td>
          <td>${formatPrice(price)}</td>
          <td>${formatPrice(value)}</td>
        </tr>
      `;
    })
    .join('');
  document.getElementById('summary-total').textContent = formatPrice(total);
}

function formatPrice(value) {
  if (state.currency === 'PLN') {
    return `${value.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN`;
  }
  const converted = value / EURO_RATE;
  return `${converted.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} EUR`;
}

function renderOrdersTable(showToast = false) {
  const tbody = document.getElementById('orders-table');
  const filtered = previousOrders.filter((order) => {
    const { company, nip, order: orderFilter, status } = state.filters;
    const boothMatch = !orderFilter || order.id.toLowerCase().includes(orderFilter);
    const exhibitorMatch = !company || order.exhibitor.toLowerCase().includes(company);
    const nipMatch = !nip || order.nip.toLowerCase().includes(nip);
    const statusMatch = status === 'all' || order.status.toLowerCase().includes(status.replace('-', ' '));
    return boothMatch && exhibitorMatch && nipMatch && statusMatch;
  });
  tbody.innerHTML = filtered
    .map(
      (order) => `
        <tr>
          <td>${order.id}</td>
          <td>${order.booth}</td>
          <td>${order.exhibitor}</td>
          <td>${order.nip}</td>
          <td>${order.status}</td>
        </tr>
      `,
    )
    .join('');
  if (showToast) {
    showTransientMessage('Odświeżono listę zamówień.');
  }
}

function renderExhibitorCard() {
  const container = document.getElementById('exhibitor-card');
  const hall = getSelectedHall();
  const booth = hall?.booths.find((item) => item.id === state.selectedBoothId);
  const lines = [
    `<strong>${state.exhibitor.name}</strong>`,
    `NIP: ${state.exhibitor.nip || '—'}`,
    `Stoisko: ${booth?.boothNumber ?? '—'} | Zamówienie: ${booth?.orderNumber ?? '—'}`,
    `Kontakt: ${state.exhibitor.contact ?? '—'}`,
    state.exhibitor.email ? `Email: ${state.exhibitor.email}` : '',
  ].filter(Boolean);
  container.innerHTML = lines.map((line) => `<div>${line}</div>`).join('');
}

function syncExhibitorForm() {
  document.getElementById('exhibitor-name').value = state.exhibitor.name ?? '';
  document.getElementById('exhibitor-nip').value = state.exhibitor.nip ?? '';
  document.getElementById('exhibitor-contact').value = state.exhibitor.contact ?? '';
  document.getElementById('exhibitor-email').value = state.exhibitor.email ?? '';
}

function getSelectedHall() {
  return halls.find((hall) => hall.id === state.selectedHallId);
}

function translateStatus(value) {
  switch (value) {
    case 'nowe':
      return 'Nowe';
    case 'zaakceptowane':
      return 'Zaakceptowane';
    case 'w-trakcie':
      return 'W trakcie';
    default:
      return value;
  }
}

function showTransientMessage(text) {
  const toast = document.createElement('div');
  toast.textContent = text;
  toast.className = 'toast';
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 2500);
}
