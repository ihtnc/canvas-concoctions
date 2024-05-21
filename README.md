![github.io](https://github.com/ihtnc/canvas-concoctions/actions/workflows/nextjs.yml/badge.svg)

# Canvas Concoctions

See it [live](https://ihtnc.github.io/canvas-concoctions/)!

This is a repository for various small, interactive applications / animations that served as a playground for ideas using the canvas HTML element.

Icons provided by https://heroicons.com/.

## Concoctions
### Sand Simulation

Simulates falling sand on the canvas.

<img alt="Sand Simulation Preview" src="/public/previews/sand-sim.gif?raw=true" width="500px" />

### Game of Life

Implementation of Conway's Game of Life.

<img alt="Game of Life Preview" src="/public/previews/game-of-life.gif?raw=true" width="500px" />

## Toggle UI elements
When accessing each concoction, query params can be added to toggle certain parts of the UI.

|Query      |Description               |
|-----------|--------------------------|
|no-nav     |Hides the navigation menu |
|no-title   |Hides the title section   |
|no-padding |Hides the outside padding |

### Example:
To view the Sand Simulation concoction without the navigation menu and the title section, use:

    /canvas-concoction/concoctions/sand-sim?no-nav&no-title

