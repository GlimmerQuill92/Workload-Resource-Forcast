# Option 2 Starter (SPA with HTML partials)
Run a local server (because fetch() won't load files from file://):
- Python: `python -m http.server 8080`
- Node: `npx http-server`

Then open http://localhost:8080/

Add new screens by creating `./screens/NAME.html` and visiting `#/NAME`.
State is saved to localStorage. Use DevTools console: `__GAME__.state` and `__GAME__.save()`.
