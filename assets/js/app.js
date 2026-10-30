/* NovelNest — all interactive features. Data: data/books.json. Browser state: localStorage (demo only). */
const BASE = document.body.dataset.base, PAGE = document.body.dataset.page, $ = (s, r = document) => r.querySelector(s);
const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } };
const sv = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const money = n => 'Rs. ' + Math.round(n).toLocaleString('en-US'), esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const params = new URLSearchParams(location.search);
let BOOKS = [], app = $('#app');
const cart = () => ls('nn_cart', {}), wish = () => ls('nn_wish', []);

function toast(m) { const t = document.createElement('div'); t.className = 'toastx'; t.setAttribute('role', 'status'); t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 2000) }
function badges() { $('#cc').textContent = Object.values(cart()).reduce((a, b) => a + b, 0); $('#wc').textContent = wish().length }
function fallback(b) { let h = 0; for (const c of b.title) h = (h * 31 + c.charCodeAt(0)) % 360; return `<div class="fb" role="img" aria-label="Cover of ${esc(b.title)}" style="background:hsl(${h},35%,28%)"><b>${esc(b.title)}</b><small>${esc(b.author)}</small></div>` }
function cover(b) {
  if (!b.cover) return fallback(b);
  return `<img class="cov" loading="lazy" src="${/^https?:/.test(b.cover) ? esc(b.cover) : BASE + esc(b.cover)}" alt="Cover of ${esc(b.title)} by ${esc(b.author)}" onerror="this.outerHTML=window.NN_FB(${b.id})">`;
}
window.NN_FB = id => fallback(BOOKS.find(b => b.id == id));
const stars = r => `<span class="star" aria-label="${r} out of 5">★ ${r.toFixed(1)}</span>`;
const card = b => `<div class="col-6 col-md-4 col-lg-3"><div class="card-book"><a class="cv" href="${BASE}book-details.php?id=${b.id}">${cover(b)}</a>
<h3><a href="${BASE}book-details.php?id=${b.id}" class="text-decoration-none">${esc(b.title)}</a></h3><small>${esc(b.author)}</small>
<div class="d-flex justify-content-between my-1"><span class="price">${money(b.price)}</span>${stars(b.rating)}</div>
<div class="mt-auto d-flex gap-1"><button class="btn btn-forest btn-sm flex-grow-1" data-add="${b.id}">Add to cart</button>
<button class="btn btn-outline-secondary btn-sm" data-wish="${b.id}" aria-label="Toggle wishlist">${wish().includes(b.id) ? '♥' : '♡'}</button></div></div></div>`;
const grid = l => l.length ? `<div class="row g-3">${l.map(card).join('')}</div>` : '<p class="demo">No books match. Try clearing a filter.</p>';
const sect = (t, l) => `<h2>${t}</h2>${grid(l)}`;

// Catalog: JSON file + this-session admin edits (sessionStorage)
async function load() {
  const base = await (await fetch(BASE + 'data/books.json')).json();
  const o = JSON.parse(sessionStorage.getItem('nn_admin') || '{"add":[],"edit":{},"del":[]}');
  BOOKS = base.filter(b => !o.del.includes(b.id)).map(b => ({ ...b, ...(o.edit[b.id] || {}) })).concat(o.add);
}

document.addEventListener('click', e => {
  const a = e.target.closest('[data-add]'), w = e.target.closest('[data-wish]');
  if (a) { const c = cart(), id = a.dataset.add; c[id] = Math.min((c[id] || 0) + 1, 10); sv('nn_cart', c); badges(); toast('Added to cart') }
  if (w) { let l = wish(); const id = +w.dataset.wish; l = l.includes(id) ? l.filter(x => x != id) : [...l, id]; sv('nn_wish', l); badges(); w.textContent = l.includes(id) ? '♥' : '♡'; if (PAGE == 'wish') R.wish() }
});

const R = {
  home() {
    const by = ids => ids.map(i => BOOKS.find(b => b.id == i)).filter(Boolean);
    const top = BOOKS.filter(b => b.bestseller).sort((x, y) => y.popularity - x.popularity).slice(0, 10);
    const cm = {}; BOOKS.forEach(b => (cm[b.category] = cm[b.category] || []).push(b));
    const cats = Object.keys(cm).sort((x, y) => cm[y].length - cm[x].length).slice(0, 12);
    const am = {}; BOOKS.forEach(b => am[b.author] = (am[b.author] || 0) + 1);
    const authors = Object.keys(am).sort((x, y) => am[y] - am[x]).slice(0, 8);
    const offers = BOOKS.filter(b => b.offer).slice(0, 3), fresh = BOOKS.filter(b => b.newArrival).slice(0, 4);
    app.innerHTML = `
<section class="hero3"><div class="container"><h1>Discover Your Next Great Read</h1>
<p>From timeless classics to contemporary bestsellers, explore a carefully curated collection of books from around the world, delivered with care.</p>
<div class="d-flex flex-wrap gap-3"><a class="btn btn-gold btn-lg" href="${BASE}books.php">Browse Collection</a><a class="btn btn-outline-light btn-lg" href="#bestsellers">Bestsellers</a></div></div></section>
<section class="cat-sec"><div class="container"><h2 class="ctr">Browse by Category</h2><p class="ctr-sub">Find your next read by genre</p>
<div class="row g-3">${cats.map(c => `<div class="col-12 col-sm-6 col-lg-3"><a class="coll" href="${BASE}books.php?cat=${encodeURIComponent(c)}"><div class="stack">${cm[c].slice(0, 2).map(b => `<div>${cover(b)}</div>`).join('')}</div><div><h3>${esc(c)}</h3><small>${cm[c].length} ${cm[c].length > 1 ? 'books' : 'book'}</small></div></a></div>`).join('')}</div>
<p class="text-center mt-4"><a class="btn btn-forest" href="${BASE}categories.php">View all categories</a></p></div></section>
<div class="container"><div class="sec-h" id="bestsellers"><h2>Bestsellers</h2><a href="${BASE}books.php">See all books</a></div>
<div class="rail">${top.map(b => `<div class="rail-i">${card(b).replace('col-6 col-md-4 col-lg-3', '')}</div>`).join('')}</div>
<div class="sec-h"><h2>Special offers</h2></div>
<div class="row g-3">${offers.map(b => `<div class="col-md-4"><div class="offer"><div class="o-img">${cover(b)}</div><div><span class="tag">Reader's pick</span><h3>${esc(b.title)}</h3><small>${esc(b.author)}</small><div class="price my-2">${money(b.price)}</div><button class="btn btn-forest btn-sm" data-add="${b.id}">Add to cart</button></div></div></div>`).join('')}</div>
<div class="sec-h"><h2>New arrivals</h2></div>${grid(fresh)}
<div class="sec-h"><h2>Popular authors</h2></div>
<div class="authors">${authors.map(a => `<a href="${BASE}books.php?author=${encodeURIComponent(a)}"><span class="av">${esc(a.split(' ').map(w => w[0]).slice(0, 2).join(''))}</span><b>${esc(a)}</b><small>${am[a]} ${am[a] > 1 ? 'books' : 'book'}</small></a>`).join('')}</div></div>`;
  },
  about() {
    app.innerHTML = `<h1>About NovelNest</h1><p class="fs-5">NovelNest is a demo bookstore showing how a warm, readable shop can bring world literature, Urdu poetry and modern bestsellers together in one place.</p>
<p>It runs without a database: the catalog lives in <code>data/books.json</code>, and your cart and wishlist are saved in this browser only. No real orders or payments are processed.</p><a class="btn btn-forest" href="books.php">Browse the shelves</a>`;
  },
  contact() {
    app.innerHTML = `<h1>Contact</h1><div class="demo"><b>Demo form.</b> Messages are not sent anywhere. A real store needs a server to receive them.</div>
<form id="f" class="col-md-7" novalidate><label class="form-label">Name</label><input class="form-control mb-2" name="n" required minlength="2"><label class="form-label">Email</label><input class="form-control mb-2" type="email" name="e" required>
<label class="form-label">Message</label><textarea class="form-control mb-3" rows="4" name="m" required minlength="10"></textarea><button class="btn btn-forest">Send message</button></form>`;
    $('#f').onsubmit = e => { e.preventDefault(); e.target.classList.add('was-validated'); if (e.target.checkValidity()) app.innerHTML = '<h1>Thanks for trying the form</h1><div class="demo"><b>Nothing was sent.</b> This is a demo, so your message was discarded.</div><a class="btn btn-forest" href="index.php">Back to home</a>' };
  },
  books() {
    const cats = [...new Set(BOOKS.map(b => b.category))].sort(), auth = [...new Set(BOOKS.map(b => b.author))].sort();
    let n = 12;
    app.innerHTML = `<h1>All books</h1><div class="row g-2 mb-3">
<div class="col-md-3"><select id="fc" class="form-select" aria-label="Category"><option value="">All categories</option>${cats.map(c => `<option>${esc(c)}</option>`).join('')}</select></div>
<div class="col-md-3"><select id="fa" class="form-select" aria-label="Author"><option value="">All authors</option>${auth.map(c => `<option>${esc(c)}</option>`).join('')}</select></div>
<div class="col-md-3"><select id="fp" class="form-select" aria-label="Price"><option value="">Any price</option><option value="3000">Under Rs. 3,000</option><option value="4500">Under Rs. 4,500</option><option value="99">Over Rs. 4,500</option></select></div>
<div class="col-md-3"><select id="fs" class="form-select" aria-label="Sort"><option value="pop">Most popular</option><option value="pa">Price: low to high</option><option value="pd">Price: high to low</option><option value="t">Title A–Z</option></select></div></div>
<div id="list"></div><div class="text-center mt-3"><button id="more" class="btn btn-forest">Load more</button></div>`;
    $('#fc').value = params.get('cat') || ''; $('#fa').value = params.get('author') || '';
    const draw = () => {
      const q = (params.get('q') || '').toLowerCase(), c = $('#fc').value, a = $('#fa').value, p = $('#fp').value, s = $('#fs').value;
      let l = BOOKS.filter(b => (!c || b.category == c) && (!a || b.author == a) && (!q || (b.title + b.author).toLowerCase().includes(q)) &&
        (!p || (p == 99 ? b.price > 4500 : b.price < +p)));
      l.sort({ pop: (x, y) => y.popularity - x.popularity, pa: (x, y) => x.price - y.price, pd: (x, y) => y.price - x.price, t: (x, y) => x.title.localeCompare(y.title) }[s]);
      $('#list').innerHTML = (q ? `<p>Results for “${esc(q)}”: ${l.length}</p>` : '') + grid(l.slice(0, n)); $('#more').style.display = l.length > n ? '' : 'none';
    };
    ['fc', 'fa', 'fp', 'fs'].forEach(i => $('#' + i).onchange = () => { n = 12; draw() }); $('#more').onclick = () => { n += 12; draw() }; draw();
  },
  detail() {
    const b = BOOKS.find(x => x.id == params.get('id'));
    if (!b) return app.innerHTML = '<p class="demo">Book not found. <a href="books.php">Browse all books</a></p>';
    const rel = BOOKS.filter(x => x.category == b.category && x.id != b.id).slice(0, 4);
    app.innerHTML = `<div class="row g-4"><div class="col-md-4 col-lg-3">${cover(b)}</div><div class="col-md-8 col-lg-9"><h1>${esc(b.title)}</h1>
<p>by <a href="books.php?author=${encodeURIComponent(b.author)}">${esc(b.author)}</a> · <a href="books.php?cat=${encodeURIComponent(b.category)}">${esc(b.category)}</a></p>
<p>${stars(b.rating)} · ${esc(b.stock)}</p><p class="fs-5">${esc(b.description)}</p><p class="price fs-3">${money(b.price)}</p>
<button class="btn btn-forest" data-add="${b.id}">Add to cart</button> <button class="btn btn-outline-secondary" data-wish="${b.id}">${wish().includes(b.id) ? '♥ Saved' : '♡ Wishlist'}</button>
<h4 class="mt-4">About the author</h4><p>${esc(b.author)} is part of our ${esc(b.category)} collection. Edit author bios in data/books.json.</p></div></div>${rel.length ? sect('Related books', rel) : ''}`;
  },
  cats() {
    const m = {}; BOOKS.forEach(b => m[b.category] = (m[b.category] || 0) + 1);
    app.innerHTML = '<h1>Categories</h1>' + Object.entries(m).sort().map(([c, n]) => `<a class="chip" href="books.php?cat=${encodeURIComponent(c)}">${esc(c)} (${n})</a>`).join('');
  },
  cart() {
    const c = cart(), items = Object.keys(c).map(id => [BOOKS.find(b => b.id == id), c[id]]).filter(x => x[0]);
    if (!items.length) return app.innerHTML = '<h1>Your cart</h1><p class="demo">Your cart is empty. <a href="books.php">Find a book</a></p>';
    const tot = items.reduce((s, [b, q]) => s + b.price * q, 0);
    app.innerHTML = `<h1>Your cart</h1>${items.map(([b, q]) => `<div class="card-book flex-row align-items-center gap-3 mb-2"><div style="width:60px">${cover(b)}</div>
<div class="flex-grow-1"><b>${esc(b.title)}</b><br><small>${money(b.price)} each</small></div>
<div class="btn-group"><button class="btn btn-outline-secondary btn-sm" data-q="${b.id}" data-d="-1" aria-label="Decrease">−</button><span class="btn btn-sm disabled">${q}</span><button class="btn btn-outline-secondary btn-sm" data-q="${b.id}" data-d="1" aria-label="Increase">+</button></div>
<b>${money(b.price * q)}</b><button class="btn btn-sm btn-outline-danger" data-rm="${b.id}">Remove</button></div>`).join('')}
<h3>Subtotal: ${money(tot)}</h3><p><small>Shipping and tax are not calculated in this demo.</small></p><h3>Total: ${money(tot)}</h3><a class="btn btn-gold" href="checkout.php">Go to checkout</a>`;
    app.onclick = e => { const x = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]'), c = cart();
      if (x) c[x.dataset.q] = Math.max(1, Math.min(10, c[x.dataset.q] + +x.dataset.d)); if (r) delete c[r.dataset.rm]; if (x || r) { sv('nn_cart', c); badges(); R.cart() } };
  },
  wish() {
    const l = BOOKS.filter(b => wish().includes(b.id));
    app.innerHTML = '<h1>Wishlist</h1>' + (l.length ? grid(l) : '<p class="demo">Nothing saved yet. Tap ♡ on any book.</p>') + (l.length ? '<button id="all" class="btn btn-gold mt-3">Move all to cart</button>' : '');
    const a = $('#all'); if (a) a.onclick = () => { const c = cart(); l.forEach(b => c[b.id] = Math.min((c[b.id] || 0) + 1, 10)); sv('nn_cart', c); sv('nn_wish', []); badges(); R.wish(); toast('Moved to cart') };
  },
  checkout() {
    const c = cart(), items = Object.keys(c).map(id => [BOOKS.find(b => b.id == id), c[id]]).filter(x => x[0]);
    if (!items.length) return app.innerHTML = '<p class="demo">Your cart is empty. <a href="books.php">Browse books</a></p>';
    const tot = items.reduce((s, [b, q]) => s + b.price * q, 0);
    app.innerHTML = `<h1>Checkout</h1><div class="demo"><b>Demo only.</b> No order is placed and no payment is taken. Payment options are for information only.</div>
<form id="f" novalidate class="row g-3"><div class="col-md-6"><label class="form-label">Full name</label><input class="form-control" name="name" required minlength="2"></div>
<div class="col-md-6"><label class="form-label">Email</label><input class="form-control" type="email" name="email" required></div>
<div class="col-md-6"><label class="form-label">Phone</label><input class="form-control" name="phone" required pattern="[0-9+ -]{7,15}"></div>
<div class="col-md-6"><label class="form-label">City</label><input class="form-control" name="city" required></div>
<div class="col-12"><label class="form-label">Address</label><input class="form-control" name="addr" required minlength="5"></div>
<div class="col-12"><label class="form-label">Payment method (information only)</label><select class="form-select" name="pay"><option>Cash on delivery</option><option>Online payment</option></select></div>
<div class="col-12"><h4>Total: ${money(tot)}</h4><button class="btn btn-forest">Review demo order</button></div></form>`;
    $('#f').onsubmit = e => { e.preventDefault(); const f = e.target; f.classList.add('was-validated'); if (!f.checkValidity()) return;
      const o = ls('nn_orders', []); o.unshift({ ref: 'DEMO-' + Date.now().toString().slice(-6), date: new Date().toLocaleString(), total: tot, items: items.map(([b, q]) => b.title + ' ×' + q) });
      sv('nn_orders', o); sv('nn_cart', {}); badges();
      app.innerHTML = `<h1>Demo checkout complete</h1><div class="demo"><b>No real order or payment was processed.</b> Nothing was sent to any store or server. A demo record was saved in this browser only (ref ${o[0].ref}).</div><a class="btn btn-forest" href="orders.php">View demo orders</a>` };
  },
  orders() {
    const o = ls('nn_orders', []);
    app.innerHTML = '<h1>Demo order history</h1><div class="demo">Stored only in this browser. Real order history needs a backend.</div>' + (o.length ? o.map(x => `<div class="card-book mb-2"><b>${x.ref}</b> · ${x.date} · ${money(x.total)}<br><small>${x.items.map(esc).join(', ')}</small></div>`).join('') : '<p>No demo orders yet.</p>');
  },
  login() {
    app.innerHTML = `<h1>Login</h1><div class="demo">Demo only. There is no server, so passwords are not stored or checked. This does not secure anything.</div>
<form id="f" class="col-md-6" novalidate><label class="form-label">Email</label><input class="form-control mb-2" type="email" name="email" required><label class="form-label">Password</label><input class="form-control mb-3" type="password" required minlength="6">
<button class="btn btn-forest">Log in (demo)</button> <a href="register.php">Create demo account</a></form>`;
    $('#f').onsubmit = e => { e.preventDefault(); e.target.classList.add('was-validated'); if (!e.target.checkValidity()) return;
      const u = ls('nn_user', null); sv('nn_user', { name: u?.name || e.target.email.value.split('@')[0], email: e.target.email.value }); location.href = 'profile.php' };
  },
  register() {
    app.innerHTML = `<h1>Create demo account</h1><div class="demo">Demo only. Only your name and email are saved in this browser. Your password is never stored.</div>
<form id="f" class="col-md-6" novalidate><label class="form-label">Name</label><input class="form-control mb-2" name="name" required minlength="2"><label class="form-label">Email</label><input class="form-control mb-2" type="email" name="email" required>
<label class="form-label">Password</label><input class="form-control mb-3" type="password" required minlength="6"><button class="btn btn-forest">Register (demo)</button></form>`;
    $('#f').onsubmit = e => { e.preventDefault(); e.target.classList.add('was-validated'); if (!e.target.checkValidity()) return;
      sv('nn_user', { name: e.target.name.value, email: e.target.email.value }); location.href = 'profile.php' };
  },
  profile() {
    const u = ls('nn_user', null);
    if (!u) return app.innerHTML = '<h1>Profile</h1><p class="demo">You are not logged in. <a href="login.php">Log in</a> or <a href="register.php">register</a> (demo).</p>';
    app.innerHTML = `<h1>Hello, ${esc(u.name)}</h1><div class="demo">Demo profile, saved in this browser only.</div><p>${esc(u.email)}</p><p>Wishlist: ${wish().length} · Demo orders: ${ls('nn_orders', []).length}</p>
<a class="btn btn-forest" href="orders.php">Demo orders</a> <button id="out" class="btn btn-outline-secondary">Log out</button>`;
    $('#out').onclick = () => { localStorage.removeItem('nn_user'); location.reload() };
  },
  admin() {
    const o = () => JSON.parse(sessionStorage.getItem('nn_admin') || '{"add":[],"edit":{},"del":[]}'), put = x => sessionStorage.setItem('nn_admin', JSON.stringify(x));
    const draw = () => { app.innerHTML = `<h1>Catalog manager (demo)</h1><div class="demo">Changes last only for this browser tab session and are not shared. There is no login, so this is not secure. For permanent edits, change data/books.json. A real store needs a server and database.</div>
<form id="f" class="row g-2 mb-3"><div class="col-md-3"><input class="form-control" name="title" placeholder="Title" required></div><div class="col-md-2"><input class="form-control" name="author" placeholder="Author" required></div>
<div class="col-md-2"><input class="form-control" name="category" placeholder="Category" required></div><div class="col-md-1"><input class="form-control" name="price" type="number" step="1" min="1" placeholder="Price" required></div>
<div class="col-md-2"><input class="form-control" name="cover" placeholder="Cover URL (optional)"></div><div class="col-md-2"><button class="btn btn-forest w-100">Add book</button></div></form>
<div class="table-responsive"><table class="table"><tr><th>Title</th><th>Author</th><th>Price</th><th></th></tr>${BOOKS.map(b => `<tr><td>${esc(b.title)}</td><td>${esc(b.author)}</td><td>${money(b.price)}</td>
<td><button class="btn btn-sm btn-outline-secondary" data-ed="${b.id}">Edit price</button> <button class="btn btn-sm btn-outline-danger" data-dl="${b.id}">Remove</button></td></tr>`).join('')}</table></div>`;
      $('#f').onsubmit = e => { e.preventDefault(); const f = e.target, x = o(); const b = { id: Date.now(), title: f.title.value, author: f.author.value, category: f.category.value, price: +f.price.value, rating: 4, popularity: 50, cover: f.cover.value, description: 'Added in the demo admin.', stock: 'In stock' };
        x.add.push(b); put(x); BOOKS.push(b); draw() };
      app.onclick = e => { const d = e.target.closest('[data-dl]'), ed = e.target.closest('[data-ed]'), x = o();
        if (d) { const id = +d.dataset.dl; x.del.push(id); x.add = x.add.filter(b => b.id != id); put(x); BOOKS = BOOKS.filter(b => b.id != id); draw() }
        if (ed) { const id = +ed.dataset.ed, v = parseFloat(prompt('New price')); if (v > 0) { x.edit[id] = { ...(x.edit[id] || {}), price: v }; x.add.forEach(b => b.id == id && (b.price = v)); put(x); BOOKS.find(b => b.id == id).price = v; draw() } } } };
    draw();
  }
};

// Instant search dropdown
function search() {
  const q = $('#q'), box = $('#sr');
  q.oninput = () => { const t = q.value.trim().toLowerCase(); if (t.length < 2) return box.classList.add('d-none');
    const r = BOOKS.filter(b => (b.title + b.author).toLowerCase().includes(t)).slice(0, 6);
    box.innerHTML = r.length ? r.map(b => `<a href="${BASE}book-details.php?id=${b.id}">${esc(b.title)} <small>— ${esc(b.author)}</small></a>`).join('') : '<a>No matches</a>'; box.classList.remove('d-none') };
  q.onkeydown = e => { if (e.key == 'Enter' && q.value.trim()) location.href = BASE + 'books.php?q=' + encodeURIComponent(q.value.trim()) };
  document.addEventListener('click', e => { if (!e.target.closest('#q,#sr')) box.classList.add('d-none') });
}
load().then(() => { badges(); search(); R[PAGE]() }).catch(() => app.innerHTML = '<p class="demo">Could not load data/books.json. Run the site through XAMPP (http://localhost/NovelNest/), not by double-clicking the files.</p>');
