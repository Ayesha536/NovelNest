# NovelNest — Demo Online Bookstore
HTML5, CSS3, JavaScript, Bootstrap 5 and Core PHP (templates only). No database, no Laravel.

## Run with XAMPP
1. Copy the `NovelNest` folder to `C:\xampp\htdocs\`.
2. Start **Apache** only in the XAMPP Control Panel (MySQL is not needed).
3. Open http://localhost/NovelNest/ (an internet connection is needed for Bootstrap, fonts and covers).

## Edit the catalog
Edit `data/books.json`. Each book has `title, author, category, price, rating, popularity, cover, description, stock`.
- **Replace a cover:** put an image in `assets/images/books/` and set `"cover": "assets/images/books/dune.jpg"` (paths are relative to the site root).
- Leave `"cover": ""` for an auto-generated, unique fallback cover.

## Covers: what to know
Covers load from Open Library by ISBN. They were **not verified** — some ISBNs may show a different edition or no image. When an image fails, a distinct generated cover appears instead of a broken link. Urdu and some Pakistani titles use generated covers until you add images. Check licensing before using publisher artwork.

## Demo vs production
| Feature | Here | Real site needs |
|---|---|---|
| Cart, wishlist | localStorage (per browser) | Works as-is, or server sessions |
| Login / register | Local demo. Passwords not stored or checked | Server-side auth, hashed passwords, HTTPS |
| Checkout / orders | Validation only. No order, no payment | Backend, database, payment gateway |
| Admin | Session-only, not shared, no login | Secure admin login and persistent database |
