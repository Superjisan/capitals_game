# Capitals Game

A browser-based quiz that tests your knowledge of world capitals.  Pick a continent (or the whole world), and guess the capital of each country shown.  Answers autocomplete from a datalist, each round shows the country's outline map and flag, and once you finish a set you can share your score as a Wordle-style emoji grid via the native share sheet (or a clipboard copy on browsers without it).

It's a static site -- plain HTML, CSS, and vanilla JS ES modules, no build step or dependencies.

## Running it locally

This project uses native ES module imports (including JSON module imports for the country/capital data), which browsers block under the `file://` protocol.  It needs to be served over HTTP.

The recommended way is the **Live Server** extension for VS Code:

1. Install [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) from the VS Code marketplace.
2. Open this folder in VS Code.
3. Right-click [index.html](index.html) and choose **Open with Live Server**, or click **Go Live** in the status bar.

Your browser opens the game automatically, and it reloads on save.

## Running the tests

Tests use [Deno](https://deno.com)'s built-in test runner with `jsdom` for DOM emulation -- no Node/npm install needed.

1. Install Deno: `brew install deno` (see [deno.com/manual/getting_started/installation](https://docs.deno.com/runtime/getting_started/installation/) for other platforms).
2. From the project root, run `deno task test`.

This runs every file under [tests/](tests/) once, headless, with no browser required.

## Deployment

The site deploys to GitHub Pages straight from the `main` branch root -- any push to `main` triggers a "pages build and deployment" run under the repo's **Actions** tab, and the live site updates automatically once it completes.  There's no separate workflow file to maintain.

Live at [jisanzaman.tech/capitals_game](https://jisanzaman.tech/capitals_game/).
