const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const STORE_PREFIX = 'zerovan-';

const storage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(`${STORE_PREFIX}${key}`);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(`${STORE_PREFIX}${key}`, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(`${STORE_PREFIX}${key}`);
  },
};

const catalog = [
  {
    id: 'iphone-12-mini', title: 'iPhone 12 Mini', category: 'phone', condition: 'Good', price: 18500,
    area: 'Indira Nagar, Nashik', distance: 2.4, listed: 'Listed today', art: 'phone',
    description: '64 GB, battery health is good. Includes a transparent case and charging cable.', seller: 'Neha Shah', label: 'JUST LISTED',
  },
  {
    id: 'thinkpad-t480', title: 'Lenovo ThinkPad T480', category: 'laptop', condition: 'Good', price: 22000,
    area: 'College Road, Nashik', distance: 5.1, listed: 'Listed yesterday', art: 'laptop',
    description: '8 GB RAM, 256 GB SSD. Keyboard and display are in good working condition.', seller: 'Rohan Mehta', label: 'GOOD CONDITION',
  },
  {
    id: 'canon-1200d', title: 'Canon EOS 1200D', category: 'camera', condition: 'Fair', price: null,
    area: 'Gangapur Road, Nashik', distance: 7.8, listed: 'Listed 2 days ago', art: 'camera',
    description: 'Camera body only. Works well with visible wear around the grip.', seller: 'Ishita Kulkarni', label: 'OPEN TO OFFERS',
  },
  {
    id: 'samsung-tab-a', title: 'Samsung Tab A', category: 'tablet', condition: 'Good', price: 6800,
    area: 'Indira Nagar, Nashik', distance: 3.2, listed: 'Listed 2 days ago', art: 'tablet',
    description: '10.1 inch tablet, Wi-Fi model. Includes a protective cover.', seller: 'Neha Shah', label: 'PICKUP READY',
  },
  {
    id: 'dell-inspiron', title: 'Dell Inspiron 14', category: 'laptop', condition: 'Fair', price: 12800,
    area: 'Panchavati, Nashik', distance: 8.4, listed: 'Listed 3 days ago', art: 'laptop',
    description: 'Good for parts or light use. Battery needs replacement but charger included.', seller: 'Arjun Patil', label: 'FAIR CONDITION',
  },
  {
    id: 'pixel-5', title: 'Google Pixel 5', category: 'phone', condition: 'Like new', price: 21000,
    area: 'CIDCO, Nashik', distance: 11.2, listed: 'Listed 4 days ago', art: 'phone',
    description: '128 GB, well protected from day one. Original box included.', seller: 'Maya Desai', label: 'LIKE NEW',
  },
  {
    id: 'nikon-d3500', title: 'Nikon D3500', category: 'camera', condition: 'Good', price: 19400,
    area: 'Canada Corner, Nashik', distance: 4.9, listed: 'Listed 4 days ago', art: 'camera',
    description: 'Body and kit lens. Low shutter count, ready for a new owner.', seller: 'Kabir Joshi', label: 'LOW SHUTTER COUNT',
  },
  {
    id: 'oneplus-buds', title: 'OnePlus Buds Pro', category: 'phone', condition: 'Good', price: 2500,
    area: 'Satpur, Nashik', distance: 12.7, listed: 'Listed 5 days ago', art: 'accessory',
    description: 'Charging case included. Both earbuds work, minor marks on the case.', seller: 'Aarav Shah', label: 'ACCESSORY',
  },
];

const defaultCustomerListings = [
  { id: 'iphone-12-mini', title: 'iPhone 12 Mini, 64 GB', category: 'phone', condition: 'Good', price: 18500, area: 'Indira Nagar, Nashik', offers: 4, art: 'phone', status: 'Live' },
  { id: 'samsung-tab-a', title: 'Samsung Tab A', category: 'tablet', condition: 'Good', price: 6800, area: 'Indira Nagar, Nashik', offers: 0, art: 'tablet', status: 'Pickup confirmed' },
  { id: 'oneplus-buds', title: 'OnePlus Buds Pro', category: 'accessory', condition: 'Good', price: 2500, area: 'Indira Nagar, Nashik', offers: 1, art: 'accessory', status: 'Live' },
];

const defaultOffers = [
  { id: 'recircuit', name: 'ReCircuit Electronics', initials: 'R', offer: 17900, distance: '2.1 km away', pickup: 'Tomorrow, 3–5 PM', message: 'We refurbish devices locally and can collect tomorrow afternoon.', recommended: true, verified: true },
  { id: 'ecocycle', name: 'EcoCycle Nashik', initials: 'EC', offer: 17200, distance: '4.6 km away', pickup: 'Within 2 days', message: 'We sort working devices for repair and resale. We can collect at your convenience.', recommended: false, verified: true, logo: 'logo-clay' },
  { id: 'upward', name: 'Upward Mobiles', initials: 'U', offer: 16800, distance: '3.8 km away', pickup: 'This weekend', message: 'We are interested in this device for parts and refurbishment.', recommended: false, verified: false, logo: 'logo-sand' },
];

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return 'Offer';
  const numeric = typeof value === 'string' ? Number(value.replace(/[^0-9]/g, '')) : Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? `₹${numeric.toLocaleString('en-IN')}` : 'Offer';
}

function parseMoney(value) {
  const amount = Number(String(value || '').replace(/[^0-9]/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function artSymbol(art) {
  return ({ phone: '▯', tablet: '▭', laptop: '▰', camera: '◉', accessory: '◌', appliance: '▣' }[art] || '⌁');
}

function artClass(art) {
  return ({ phone: 'item-art-phone', tablet: 'item-art-phone', laptop: 'item-art-laptop', camera: 'item-art-camera', accessory: 'item-art-camera', appliance: 'item-art-laptop' }[art] || 'item-art-phone');
}

function itemArt(item, className = '') {
  const symbolClass = item.art === 'laptop' ? 'laptop-symbol' : item.art === 'camera' ? 'camera-symbol' : '';
  return `<div class="item-art ${artClass(item.art)} ${className}"><span class="item-art-device ${symbolClass}">${artSymbol(item.art)}</span>${item.art === 'phone' || item.art === 'tablet' ? '<span class="item-art-shine">✦</span>' : ''}</div>`;
}

function getCustomListings() {
  return storage.get('customer-listings', []);
}

function getMarketItems() {
  return [...catalog, ...getCustomListings().map((item) => ({ ...item, label: 'NEW FROM A NEIGHBOR', listed: 'Listed just now', distance: 6.5, seller: 'A Zerovan customer' }))];
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(window.zerovanToastTimer);
  window.zerovanToastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4000);
}

function getSavedIds() {
  return storage.get('saved-items', ['thinkpad-t480', 'canon-1200d']);
}

function setSavedIds(ids) {
  storage.set('saved-items', ids);
}

function isSaved(id) {
  return getSavedIds().includes(id);
}

function setupSharedActions() {
  document.addEventListener('click', (event) => {
    const toastTrigger = event.target.closest('[data-toast]');
    if (toastTrigger) {
      showToast(toastTrigger.dataset.toast);
    }

    const menuTrigger = event.target.closest('[data-menu-toggle]');
    if (menuTrigger) {
      const menu = $(`#${menuTrigger.dataset.menuToggle}`);
      if (menu) {
        $$('.account-menu').forEach((item) => item !== menu && item.classList.add('is-hidden'));
        menu.classList.toggle('is-hidden');
      }
      return;
    }

    if (!event.target.closest('.account-menu')) {
      $$('.account-menu').forEach((menu) => menu.classList.add('is-hidden'));
    }

    if (event.target.closest('[data-logout]')) {
      storage.remove('active-role');
      window.location.href = 'index.html';
    }
  });
}

function initAuth() {
  const form = $('#auth-form');
  if (!form) return;

  const roleChoices = $$('[data-auth-role]');
  const feedback = $('#auth-feedback');
  const heading = $('#auth-title');
  const intro = $('#auth-intro');
  const submitLabel = $('#auth-submit-label');
  let selectedRole = storage.get('active-role', '');

  function selectRole(role) {
    selectedRole = role;
    const input = $(`#${role}-role`);
    if (input) input.checked = true;
    roleChoices.forEach((choice) => {
      const active = choice.dataset.authRole === role;
      choice.classList.toggle('is-selected', active);
      choice.setAttribute('aria-pressed', String(active));
    });
    if (feedback) feedback.textContent = '';
  }

  if (selectedRole) selectRole(selectedRole);
  roleChoices.forEach((choice) => choice.addEventListener('click', () => selectRole(choice.dataset.authRole)));

  $$('.auth-tab').forEach((tab) => tab.addEventListener('click', () => {
    const mode = tab.dataset.authMode;
    $$('.auth-tab').forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });
    const creating = mode === 'create';
    heading.textContent = creating ? 'Start with your role.' : 'Welcome back.';
    intro.textContent = creating ? 'Tell us whether you are listing an item or sourcing for your business.' : 'Choose the workspace that fits what you’re here to do.';
    submitLabel.textContent = creating ? 'Create demo workspace' : 'Sign in to Zerovan';
  }));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value.trim();
    if (!selectedRole) {
      feedback.textContent = 'Choose Customer or Vendor / organization to continue.';
      return;
    }
    if (!email || !email.includes('@')) {
      feedback.textContent = 'Enter a valid email address to continue.';
      form.elements.email.focus();
      return;
    }
    if (password.length < 4) {
      feedback.textContent = 'Enter a password with at least four characters.';
      form.elements.password.focus();
      return;
    }
    storage.set('active-role', selectedRole);
    storage.set('profile-email', email);
    window.location.href = selectedRole === 'vendor' ? 'vendor.html' : 'customer.html';
  });
}

function setupWorkspaceTabs(kind) {
  const buttonSelector = `[data-${kind}-section]`;
  const viewSelector = `[data-${kind}-view]`;
  const allowed = $$(viewSelector).map((view) => view.dataset[`${kind}View`]);

  function activate(section, updateHash = true) {
    const target = allowed.includes(section) ? section : allowed[0];
    $$(viewSelector).forEach((view) => view.classList.toggle('is-hidden', view.dataset[`${kind}View`] !== target));
    $$(buttonSelector).forEach((button) => button.classList.toggle('is-active', button.dataset[`${kind}Section`] === target));
    if (updateHash) history.replaceState(null, '', `${window.location.pathname}#${target}`);
  }

  $$(buttonSelector).forEach((button) => button.addEventListener('click', () => activate(button.dataset[`${kind}Section`])));
  activate(window.location.hash.slice(1), false);
}

function renderCustomerListings() {
  const container = $('#customer-listings');
  if (!container) return;
  const custom = getCustomListings();
  const allListings = [...defaultCustomerListings, ...custom.map((item) => ({ ...item, status: 'Live', offers: 0 }))];
  container.innerHTML = allListings.map((item) => {
    const customItem = custom.some((saved) => saved.id === item.id);
    const offerText = item.status === 'Pickup confirmed' ? 'Pickup confirmed' : item.offers ? `${item.offers} new offer${item.offers > 1 ? 's' : ''}` : 'Waiting for vendor interest';
    return `<article class="listing-manager-card">
      ${itemArt(item)}
      <div>
        <div class="listing-card-meta"><span class="status-pill ${item.status === 'Pickup confirmed' ? 'status-green' : item.offers ? 'status-amber' : 'status-gray'}">${escapeHtml(offerText)}</span><small>${customItem ? 'Listed just now' : escapeHtml(item.area)}</small></div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.condition)} condition · ${item.price ? formatMoney(item.price) : 'Open to offers'}</p>
      </div>
      <div class="listing-actions">${item.offers ? `<a class="text-link" href="listing.html">Review <span>→</span></a>` : customItem ? `<button type="button" data-delete-listing="${escapeHtml(item.id)}">Remove</button>` : '<button type="button" data-toast="This listing is waiting for nearby vendors to respond.">Share</button>'}</div>
    </article>`;
  }).join('');
  const count = allListings.length;
  ['#listing-count', '#overview-live-listings'].forEach((selector) => { const element = $(selector); if (element) element.textContent = count; });
}

function initCustomer() {
  setupWorkspaceTabs('customer');
  renderCustomerListings();
  document.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-delete-listing]');
    if (!remove) return;
    const listings = getCustomListings().filter((item) => item.id !== remove.dataset.deleteListing);
    storage.set('customer-listings', listings);
    renderCustomerListings();
    showToast('The listing was removed from your demo workspace.');
  });
}

function initVendor() {
  setupWorkspaceTabs('vendor');
  renderVendorApplications();
  renderSavedItems();
  document.addEventListener('click', (event) => {
    const save = event.target.closest('[data-save-item]');
    if (!save) return;
    const id = save.dataset.saveItem;
    setSavedIds(getSavedIds().filter((item) => item !== id));
    renderSavedItems();
    showToast('Item removed from your shortlist.');
  });
}

function getApplications() {
  return storage.get('vendor-applications', [
    { id: 'application-iphone', itemId: 'iphone-12-mini', itemTitle: 'iPhone 12 Mini', amount: 17900, pickup: 'Within 24 hours', status: 'Awaiting seller', art: 'phone' },
    { id: 'application-dell', itemId: 'dell-inspiron', itemTitle: 'Dell Inspiron 14', amount: 11900, pickup: 'This weekend', status: 'Awaiting seller', art: 'laptop' },
  ]);
}

function renderVendorApplications() {
  const container = $('#vendor-applications');
  if (!container) return;
  const applications = getApplications();
  container.innerHTML = applications.length ? applications.map((application) => `<article class="application-card">
    ${itemArt({ art: application.art })}
    <div><span class="status-pill ${application.status === 'Accepted' ? 'status-green' : 'status-gray'}">${escapeHtml(application.status)}</span><h3>${escapeHtml(application.itemTitle)}</h3><p>Preferred pickup: ${escapeHtml(application.pickup)}</p></div>
    <div class="application-price">${formatMoney(application.amount)}<small>${application.status === 'Accepted' ? 'Accepted offer' : 'Your offer'}</small></div>
  </article>`).join('') : '<article class="empty-tip"><span>⌕</span><div><strong>No applications yet</strong><p>Explore nearby items and apply when you find a useful fit.</p></div></article>';
  const count = $('#application-count');
  if (count) count.textContent = applications.filter((item) => item.status === 'Awaiting seller').length;
  const navCount = $('#application-alert-count');
  if (navCount) navCount.textContent = applications.filter((item) => item.status === 'Awaiting seller').length;
}

function renderSavedItems() {
  const container = $('#saved-items-grid');
  if (!container) return;
  const savedIds = getSavedIds();
  const items = getMarketItems().filter((item) => savedIds.includes(item.id));
  container.innerHTML = items.length ? items.map((item) => `<article class="saved-mini-card">${itemArt(item)}<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.condition)} · ${formatMoney(item.price)}</p><div><span>${item.distance || 6.5} km away</span><button class="remove-saved" type="button" data-save-item="${escapeHtml(item.id)}">Remove</button></div></article>`).join('') : '<article class="empty-tip"><span>♡</span><div><strong>No saved items yet</strong><p>Use the heart on any marketplace card to add it here.</p></div></article>';
  const count = $('#saved-count');
  if (count) count.textContent = savedIds.length;
}

function initListingFlow() {
  const form = $('#listing-form');
  if (!form) return;
  let currentStep = 1;
  let imageUrl = '';

  function updatePreview() {
    const title = $('#listing-title').value.trim();
    const category = $('#listing-category').value;
    const condition = $('#listing-condition').value;
    const price = $('#listing-price').value;
    const area = $('#listing-area').value.trim();
    $('#preview-title').textContent = title || 'Your item title';
    $('#preview-meta').textContent = category ? `${category.charAt(0).toUpperCase()}${category.slice(1)} · ${condition}` : 'Choose a category and condition';
    $('#preview-price').textContent = price.trim() ? formatMoney(price) : 'Open to offers';
    $('#preview-area').textContent = area ? `⌖ ${area}` : '⌖ Your pickup area will appear here';
  }

  function showStep(nextStep) {
    currentStep = nextStep;
    $$('[data-listing-step]').forEach((step) => step.classList.toggle('is-hidden', Number(step.dataset.listingStep) !== nextStep));
    $$('[data-step-indicator]').forEach((step) => step.classList.toggle('is-active', Number(step.dataset.stepIndicator) === nextStep));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateStep(step) {
    const rules = {
      1: ['#listing-title', '#listing-category'],
      2: [],
      3: ['#listing-area'],
    };
    for (const selector of rules[step] || []) {
      const element = $(selector);
      if (!element || !element.value.trim()) {
        element?.focus();
        showToast('Please complete the highlighted detail before continuing.');
        return false;
      }
    }
    return true;
  }

  $$('[data-next-step]').forEach((button) => button.addEventListener('click', () => {
    if (validateStep(currentStep)) showStep(Number(button.dataset.nextStep));
  }));
  $$('[data-previous-step]').forEach((button) => button.addEventListener('click', () => showStep(Number(button.dataset.previousStep))));
  $$('[data-condition]').forEach((button) => button.addEventListener('click', () => {
    $$('[data-condition]').forEach((item) => { item.classList.toggle('is-selected', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    $('#listing-condition').value = button.dataset.condition;
    updatePreview();
  }));
  ['#listing-title', '#listing-category', '#listing-description', '#listing-price', '#listing-area'].forEach((selector) => $(selector)?.addEventListener('input', updatePreview));

  $('#listing-image')?.addEventListener('change', (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = URL.createObjectURL(file);
    const uploadImage = $('#uploaded-image');
    const previewImage = $('#listing-preview-image');
    uploadImage.src = imageUrl;
    previewImage.innerHTML = `<img src="${imageUrl}" alt="Selected listing preview" />`;
    $('#uploaded-preview').classList.remove('is-hidden');
  });
  $('#remove-image')?.addEventListener('click', () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = '';
    $('#listing-image').value = '';
    $('#uploaded-preview').classList.add('is-hidden');
    $('#listing-preview-image').innerHTML = '<span class="preview-placeholder">⌁</span>';
  });
  $('[data-save-draft]')?.addEventListener('click', () => {
    const draft = Object.fromEntries(new FormData(form).entries());
    storage.set('listing-draft', draft);
    showToast('Your listing draft is saved in this browser.');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateStep(3) || !form.elements.privacy.checked) {
      showToast('Confirm the pickup privacy note before publishing.');
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    const item = {
      id: `listing-${Date.now()}`,
      title: data.title.trim(),
      category: data.category,
      condition: data.condition,
      price: parseMoney(data.price),
      area: data.area.trim(),
      art: data.category,
      description: data.description.trim() || 'A new Zerovan listing from a local customer.',
    };
    storage.set('customer-listings', [item, ...getCustomListings()]);
    storage.remove('listing-draft');
    window.location.href = 'customer.html#listings';
  });
}

function getDeclinedOffers() {
  return storage.get('declined-offers', []);
}

function getDeal() {
  return storage.get('deal', {
    status: 'scheduled', itemTitle: 'Samsung Tab A', itemArt: 'tablet', offer: 6800,
    vendor: 'ReCircuit Electronics', customer: 'Neha Shah', date: 'Tomorrow, 25 October', time: '3:00–5:00 PM', area: 'Indira Nagar pickup area',
  });
}

function renderCustomerOffers() {
  const container = $('#customer-offers');
  if (!container) return;
  const deal = getDeal();
  const declined = getDeclinedOffers();
  const offers = defaultOffers.filter((offer) => !declined.includes(offer.id));
  if (deal.itemTitle === 'iPhone 12 Mini' && deal.status !== 'completed') {
    container.innerHTML = `<article class="empty-tip"><span>✓</span><div><strong>You selected ${escapeHtml(deal.vendor)}</strong><p>Your pickup plan is ready. Other offers are no longer available for this listing.</p><a href="deal.html?role=customer" class="text-link">Open handover <span>→</span></a></div></article>`;
    return;
  }
  container.innerHTML = offers.length ? offers.map((offer) => `<article class="vendor-offer-card ${offer.recommended ? 'is-recommended' : ''}">
    ${offer.recommended ? '<span class="offer-label">BEST MATCH</span>' : ''}
    <div class="offer-company-line"><span class="offer-logo ${offer.logo || ''}">${escapeHtml(offer.initials)}</span><div><h3>${escapeHtml(offer.name)} ${offer.verified ? '<span class="verified">✓</span>' : ''}</h3><p>${offer.verified ? 'Verified local business' : 'Local repair business'} · ${escapeHtml(offer.distance)}</p></div><strong class="offer-amount">${formatMoney(offer.offer)}<small>Offer amount</small></strong></div>
    <p class="offer-message">“${escapeHtml(offer.message)}”</p>
    <div class="offer-footer"><span>Can collect: ${escapeHtml(offer.pickup)}</span><div class="offer-footer-actions"><button class="decline-offer" type="button" data-decline-offer="${offer.id}">Decline</button><button class="button button-small ${offer.recommended ? 'button-dark' : 'button-outline'}" type="button" data-accept-offer="${offer.id}">Accept offer</button></div></div>
  </article>`).join('') : '<article class="empty-tip"><span>⌁</span><div><strong>All current offers have been cleared.</strong><p>Your listing stays active until you choose to pause it.</p></div></article>';
}

function initListingDetail() {
  renderCustomerOffers();
  document.addEventListener('click', (event) => {
    const accept = event.target.closest('[data-accept-offer]');
    const decline = event.target.closest('[data-decline-offer]');
    if (accept) {
      window.selectedOffer = defaultOffers.find((offer) => offer.id === accept.dataset.acceptOffer);
      $('#schedule-modal')?.classList.remove('is-hidden');
      document.body.style.overflow = 'hidden';
    }
    if (decline) {
      storage.set('declined-offers', [...new Set([...getDeclinedOffers(), decline.dataset.declineOffer])]);
      renderCustomerOffers();
      showToast('Offer declined. The vendor will not see your exact pickup details.');
    }
  });
  $$('[data-close-modal]').forEach((button) => button.addEventListener('click', closeScheduleModal));
  $('#schedule-modal')?.addEventListener('click', (event) => { if (event.target.id === 'schedule-modal') closeScheduleModal(); });
  $('#schedule-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const offer = window.selectedOffer || defaultOffers[0];
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.date || !data.time) {
      showToast('Choose a date and pickup window to continue.');
      return;
    }
    storage.set('deal', { status: 'scheduled', itemTitle: 'iPhone 12 Mini', itemArt: 'phone', offer: offer.offer, vendor: offer.name, customer: 'Neha Shah', date: new Date(`${data.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), time: data.time, area: 'Indira Nagar pickup area', note: data.note.trim() });
    window.location.href = 'deal.html?role=customer';
  });
}

function closeScheduleModal() {
  $('#schedule-modal')?.classList.add('is-hidden');
  document.body.style.overflow = '';
}

function initMarketplace() {
  const grid = $('#market-grid');
  if (!grid) return;
  const filters = { category: 'all', query: '', conditions: new Set(), sort: 'recent' };
  const searchInput = $('#market-search');
  const sort = $('#market-sort');

  function render() {
    const allItems = getMarketItems();
    let items = [...allItems];
    if (filters.category !== 'all') items = items.filter((item) => item.category === filters.category);
    if (filters.conditions.size) items = items.filter((item) => filters.conditions.has(item.condition));
    if (filters.query) items = items.filter((item) => `${item.title} ${item.category} ${item.condition}`.toLowerCase().includes(filters.query.toLowerCase()));
    if (filters.sort === 'nearby') items.sort((a, b) => (a.distance || 6.5) - (b.distance || 6.5));
    if (filters.sort === 'price-low') items.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (filters.sort === 'price-high') items.sort((a, b) => (b.price || 0) - (a.price || 0));
    $('#market-result-count').textContent = items.length;
    ['all', 'phone', 'laptop', 'tablet', 'camera'].forEach((category) => {
      const counter = $(`#category-count-${category}`);
      if (counter) counter.textContent = category === 'all' ? allItems.length : allItems.filter((item) => item.category === category).length;
    });
    $('#market-result-copy').textContent = items.length === 1 ? 'One listing matches your filters' : 'Sorted by your chosen filters';
    const active = [];
    if (filters.category !== 'all') active.push(filters.category.charAt(0).toUpperCase() + filters.category.slice(1));
    filters.conditions.forEach((condition) => active.push(condition));
    if (filters.query) active.push(`“${filters.query}”`);
    $('#active-filters').innerHTML = active.map((filter) => `<span class="filter-tag">${escapeHtml(filter)}<button type="button" data-remove-filter="${escapeHtml(filter)}" aria-label="Remove ${escapeHtml(filter)} filter">×</button></span>`).join('');
    grid.innerHTML = items.map((item) => `<article class="market-listing-card">
      <div class="market-image ${artClass(item.art)}"><span class="listing-badge">${escapeHtml(item.label || 'NEARBY')}</span><button class="save-listing ${isSaved(item.id) ? 'is-saved' : ''}" type="button" data-save-item="${escapeHtml(item.id)}" aria-label="${isSaved(item.id) ? 'Remove' : 'Save'} ${escapeHtml(item.title)}">${isSaved(item.id) ? '♥' : '♡'}</button><span class="item-art-device ${item.art === 'laptop' ? 'laptop-symbol' : item.art === 'camera' ? 'camera-symbol' : ''}">${artSymbol(item.art)}</span></div>
      <div class="market-card-copy"><div class="market-card-title-line"><h3>${escapeHtml(item.title)}</h3><strong>${formatMoney(item.price)}</strong></div><p>${escapeHtml(item.condition)} condition · ${escapeHtml(item.area)}</p><div class="market-card-footer"><span>${item.distance || 6.5} km away</span><a href="offer.html?id=${encodeURIComponent(item.id)}">Make offer <span>→</span></a></div></div>
    </article>`).join('');
    $('#empty-market').classList.toggle('is-hidden', items.length > 0);
    grid.classList.toggle('is-hidden', items.length === 0);
  }

  $$('[data-category]').forEach((button) => button.addEventListener('click', () => {
    filters.category = button.dataset.category;
    $$('[data-category]').forEach((item) => item.classList.toggle('is-active', item === button));
    render();
  }));
  $$('[data-condition]').forEach((checkbox) => checkbox.addEventListener('change', () => {
    checkbox.checked ? filters.conditions.add(checkbox.value) : filters.conditions.delete(checkbox.value);
    render();
  }));
  searchInput.addEventListener('input', () => { filters.query = searchInput.value.trim(); render(); });
  sort.addEventListener('change', () => { filters.sort = sort.value; render(); });
  function clearFilters() {
    filters.category = 'all'; filters.query = ''; filters.conditions.clear(); filters.sort = 'recent';
    searchInput.value = ''; sort.value = 'recent'; $$('[data-category]').forEach((button) => button.classList.toggle('is-active', button.dataset.category === 'all')); $$('[data-condition]').forEach((checkbox) => { checkbox.checked = false; }); render();
  }
  $('#clear-filters')?.addEventListener('click', clearFilters);
  $('#empty-clear')?.addEventListener('click', clearFilters);
  document.addEventListener('click', (event) => {
    const save = event.target.closest('[data-save-item]');
    if (save) {
      const ids = getSavedIds(); const id = save.dataset.saveItem;
      setSavedIds(ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
      render();
      showToast(isSaved(id) ? 'Item saved to your shortlist.' : 'Item removed from your shortlist.');
    }
    const removeFilter = event.target.closest('[data-remove-filter]');
    if (removeFilter) {
      const value = removeFilter.dataset.removeFilter.replace(/[“”]/g, '');
      if (filters.category.toLowerCase() === value.toLowerCase()) filters.category = 'all';
      filters.conditions.delete(value);
      if (filters.query === value) { filters.query = ''; searchInput.value = ''; }
      $$('[data-category]').forEach((button) => button.classList.toggle('is-active', button.dataset.category === filters.category));
      $$('[data-condition]').forEach((checkbox) => { checkbox.checked = filters.conditions.has(checkbox.value); });
      render();
    }
  });
  render();
}

function initOfferPage() {
  const panel = $('#offer-item-panel');
  const form = $('#offer-form');
  if (!panel || !form) return;
  const itemId = new URLSearchParams(window.location.search).get('id') || 'iphone-12-mini';
  const item = getMarketItems().find((candidate) => candidate.id === itemId) || catalog[0];
  panel.innerHTML = `${itemArt(item, 'offer-item-art')}<span class="status-pill status-green">${escapeHtml(item.label || 'NEARBY')}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.condition)} condition · ${escapeHtml(item.area)} · ${item.distance || 6.5} km away</p><div class="item-details-grid"><div><span>Listed price</span><strong>${formatMoney(item.price)}</strong></div><div><span>Seller</span><strong>${escapeHtml(item.seller || 'A Zerovan customer')}</strong></div><div><span>Pickup</span><strong>${escapeHtml(item.area)}</strong></div></div><div class="seller-note"><strong>Seller note</strong>${escapeHtml(item.description)}</div>`;
  $('#offer-item-id').value = item.id;
  $('#offer-amount').value = item.price ? formatMoney(item.price) : '';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const amount = parseMoney(data.amount);
    if (!amount || !data.message.trim() || !data.pickup || !form.elements.confirm.checked) {
      $('#offer-feedback').textContent = 'Complete your offer, message, pickup preference, and acknowledgment.';
      return;
    }
    const applications = getApplications().filter((application) => application.itemId !== item.id);
    applications.unshift({ id: `application-${Date.now()}`, itemId: item.id, itemTitle: item.title, amount, pickup: data.pickup, status: 'Awaiting seller', art: item.art, message: data.message.trim() });
    storage.set('vendor-applications', applications);
    window.location.href = 'vendor.html#applications';
  });
}

function initDealPage() {
  const main = $('#deal-main');
  if (!main) return;
  const role = new URLSearchParams(window.location.search).get('role') === 'vendor' ? 'vendor' : 'customer';
  const deal = getDeal();
  $('#deal-home-link').href = role === 'vendor' ? 'vendor.html' : 'customer.html';
  $('#deal-back-link').href = role === 'vendor' ? 'vendor.html#pickups' : 'customer.html#pickups';
  $('#deal-back-link').innerHTML = '<span>←</span> Back to workspace';
  const completed = deal.status === 'completed';
  const actionText = role === 'vendor' ? 'Mark item collected' : 'Confirm handover complete';
  const description = completed ? 'The handover is complete. This item has a useful next chapter.' : role === 'vendor' ? 'Prepare for collection and update the handover once the item is with you.' : 'Your vendor is confirmed. Review the plan and complete the handover once collection is finished.';
  main.innerHTML = `<div class="deal-status-top"><i></i>${completed ? 'Handover complete' : 'Pickup confirmed'}</div><h1>${completed ? 'One more useful item, still in motion.' : 'Everything is set for a smooth handover.'}</h1><p>${description}</p><article class="deal-card"><div class="deal-card-head"><div class="deal-item-line">${itemArt({ art: deal.itemArt || 'tablet' })}<div><h2>${escapeHtml(deal.itemTitle)}</h2><p>${role === 'vendor' ? `Collecting from ${escapeHtml(deal.customer)}` : `Collected by ${escapeHtml(deal.vendor)}`}</p></div></div><strong class="deal-price">${formatMoney(deal.offer)}<small>Agreed amount</small></strong></div><div class="handover-timeline"><div class="timeline-item"><span class="timeline-point">✓</span><div><h3>Offer accepted</h3><p>The seller chose this offer and opened pickup details.</p></div></div><div class="timeline-item"><span class="timeline-point">✓</span><div><h3>Pickup window confirmed</h3><p>${escapeHtml(deal.date)} · ${escapeHtml(deal.time)}</p></div></div><div class="timeline-item ${completed ? '' : 'is-pending'}"><span class="timeline-point">${completed ? '✓' : '3'}</span><div><h3>${completed ? 'Handover completed' : 'Complete the handover'}</h3><p>${completed ? 'The collection has been recorded in this workspace.' : 'Inspect the item together, then mark the collection as complete.'}</p></div></div></div><div class="deal-info-row"><div><span>Pickup area</span><strong>${escapeHtml(deal.area)}</strong></div><div><span>Pickup note</span><strong>${escapeHtml(deal.note || 'No additional note')}</strong></div></div>${completed ? '<div class="deal-complete-panel">✓ This demo handover has been marked complete. Your impact and completed item count can now update through a real backend.</div>' : `<div class="deal-actions"><button class="button button-outline" type="button" id="reschedule-deal">Request a different time</button><button class="button button-primary" type="button" id="complete-deal">${actionText} <span>✓</span></button></div>`}</article>`;
  $('#complete-deal')?.addEventListener('click', () => {
    storage.set('deal', { ...deal, status: 'completed' });
    initDealPage();
    showToast('The handover is marked complete in this demo workspace.');
  });
  $('#reschedule-deal')?.addEventListener('click', () => showToast('A rescheduling message can be sent through the note panel.'));
  $('#message-toggle')?.addEventListener('click', () => $('#message-form')?.classList.toggle('is-hidden'));
  $('#message-form')?.addEventListener('submit', (event) => { event.preventDefault(); const message = new FormData(event.currentTarget).get('message').trim(); if (!message) { showToast('Write a short pickup note before sending.'); return; } event.currentTarget.reset(); event.currentTarget.classList.add('is-hidden'); showToast('Your pickup note was added to this demo handover.'); });
}

function initPage() {
  setupSharedActions();
  const page = document.body.dataset.page;
  if (page === 'auth') initAuth();
  if (page === 'customer') initCustomer();
  if (page === 'vendor') initVendor();
  if (page === 'create-listing') initListingFlow();
  if (page === 'listing') initListingDetail();
  if (page === 'marketplace') initMarketplace();
  if (page === 'offer') initOfferPage();
  if (page === 'deal') initDealPage();
}

initPage();
