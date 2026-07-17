# Beautiful 3D Space

A React + Vite + Three.js solar system with **real planet textures**, Arka MCP live telemetry, and orbit controls.

## Features

- Textured Sun, Earth, Moon, Mars, and Saturn (with rings) via `@react-three/drei` `useTexture`
- ISS, asteroid belt, orbit rings, labels, pause/speed controls
- Live moon phase & space facts from **Arka MCP** (`arka_ask`, `arka_skill astronomy`, `arka_timekit`)

## Textures

| Body | Source |
|------|--------|
| Earth (+ normal + specular) | [three.js examples](https://threejs.org/examples/textures/planets/) / NASA |
| Moon | three.js examples / NASA |
| Mars, Sun, Saturn, rings | [Solar System Scope](https://www.solarsystemscope.com/textures/) |

Files live in `public/textures/`.

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL in your browser.

## Arka MCP

Initialize the scoped code project (once):

```bash
arka code init "/Users/sumitmishra/dev/3d space simulation"
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
