# Chatbot Static Site
This project is now a static Vue.js chatbot suitable for GitHub Pages. All logic runs in the browser; no backend required.

## Local Preview
1. Ensure `publicPath` is set to `/hawksung1.github.io/` in `vue.config.js`.
2. Run `npm install` in the project root.
3. Build the project: `npm run build`
4. Serve the `dist/` folder locally (e.g., with `npx serve dist`)
5. Access the app at `http://localhost:5000/hawksung1.github.io/` (or your local server port)

## Deploying to GitHub Pages
1. Ensure publicPath is set in vue.config.js for GitHub Pages.
2. Run `npm install gh-pages` in the project root.
3. Use `npm run deploy` to build and publish.
4. Set GitHub Pages source to `gh-pages` branch in repository settings.

## Directory Structure
- `src/components/` for Vue components (e.g., App.vue)
- `src/utils/` for utility logic (e.g., chatbot.js)
- `src/main.js` is the entry point
- No backend required

## Notes
- All chatbot features work statically
- No API calls or server needed
