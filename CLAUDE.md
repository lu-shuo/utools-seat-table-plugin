# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a uTools plugin application (学生排座助手 - Student Seating Assistant) built with Vue 3 and Vite. uTools is a desktop launcher platform where plugins run in a separate environment with access to Node.js capabilities through a preload script.

## Build and Development Commands

- `npm run dev` - Start Vite dev server on http://localhost:5173
- `npm run build` - Build for production

## uTools Plugin Architecture

### Dual-Environment Structure

The application runs in two separate JavaScript environments:

1. **Preload Script** (`public/preload/services.js`): CommonJS module that runs in a Node.js environment with full file system access. It injects Node.js capabilities into the renderer via `window.services`.

2. **Renderer Process** (`src/`): Vue 3 SPA that runs in a browser-like environment. Accesses Node.js capabilities through the injected `window.services` object.

### Configuration

`public/plugin.json` defines:
- Plugin metadata and entry points
- Development mode uses `http://localhost:5173`
- Production mode uses `index.html`
- Feature definitions with `code` (route identifier) and `cmds` (trigger keywords/patterns)

### Plugin Lifecycle

The main App component (src/App.vue:11-17) listens to uTools lifecycle events:
- `window.utools.onPluginEnter((action) => {})` - Receives the feature `code` and activation payload
- `window.utools.onPluginOut((isKill) => {})` - Cleanup when plugin is hidden

The `action.code` determines which component to render (Hello, Read, or Write).

### Route System

This app uses a manual routing system based on the `action.code` from uTools, not Vue Router:
- Route state is managed in `src/App.vue` via `route` ref
- Components are conditionally rendered based on `route` value matching feature codes from `plugin.json`

### File Access Pattern

When adding features that need file system access:
1. Add new methods to `window.services` in `public/preload/services.js` (CommonJS)
2. Call these methods from Vue components via `window.services.methodName()`
3. Remember: preload script has full Node.js access; renderer has none

### Working with uTools API

The `window.utools` object provides platform APIs:
- `showOpenDialog()` - Native file picker
- `showNotification()` - System notifications
- `shellShowItemInFolder()` - Open file location in OS file manager
- `getPath('downloads')` - Get system paths
- `outPlugin()` - Exit the plugin

### Adding New Features

To add a new feature:
1. Add feature definition to `public/plugin.json` with unique `code` and `cmds`
2. Create new component in `src/YourFeature/index.vue`
3. Import and add conditional rendering in `src/App.vue` based on `route === 'your-code'`
4. If Node.js access needed, extend `window.services` in `public/preload/services.js`

### TypeScript Support

The project uses TypeScript in Vue SFC `<script lang="ts" setup>` blocks with `utools-api-types` for type definitions. However, there's no tsconfig.json, so TypeScript checking is minimal (IDE hints only).
