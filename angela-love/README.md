# For Angela 💖

A cute single-page love web app with animations, photos, stickers, GIFs, and a love note composer.

## Run locally

- Open `index.html` directly in a browser, or
- Serve with a simple server:

```bash
python3 -m http.server 5173 --directory .
```

Then visit `http://localhost:5173`.

## Customize

- Edit the relationship start date and lines in `script.js`:
```js
const appState = {
  relationshipStartISO: '2023-02-14',
  typewriterLines: [ 'Angela, you are my favorite notification.' ]
}
```
- Replace sample photos by editing `renderPhotos()` in `script.js` or drop files into `assets/photos` and point to them.
- Add or remove GIF URLs in `appState.gifUrls`.
- Add your own stickers by placing PNGs into `assets/stickers` and adding their URLs to `appState.stickerUrls`.

## Features

- Floating heart canvas animation
- Typewriter love lines
- Photo gallery with captions
- Stickerboard with drag, rotate (double-click), delete (right-click)
- Love note composer with local storage
- Share button (Web Share API or clipboard fallback)
- Days together counter

## Credits

- Stickers powered by Twemoji assets
- Sample music via Pixabay
- Sample photos via Unsplash