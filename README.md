# CMOS Layout Design Tool

A web-based layout editor for CMOS circuit design that allows users to create and manipulate different layers of a CMOS circuit, perform DRC (Design Rule Checking), and visualize the layout.

## Features

### 1. Layer Management

- Six different layers available:
  - Metal1 (Red)
  - Metal2 (Green)
  - Poly (Blue)
  - Diffusion (Yellow)
  - Well (Magenta)
  - Contact (Cyan)
- Each layer can be toggled visible/invisible
- Layers can be selected for drawing

### 2. Drawing Tools

- Click and drag to create shapes
- Shapes automatically snap to grid (20px per lambda unit)
- Each shape can be:
  - Dragged to move
  - Resized using the corner handle
  - Deleted (if implemented)

### 3. Grid System

- Grid lines every lambda unit (20px)
- Thicker lines every 5 lambda units
- All shapes snap to grid for proper alignment

### 4. DRC (Design Rule Checking)

- Checks for:
  - Minimum width violations
  - Spacing violations
  - Enclosure violations
- Violations are highlighted in red
- Run DRC checks using the DRC panel

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone [repository-url]
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

## How to Use

### Creating Shapes

1. Select a layer from the layer panel
2. Click and drag on the canvas to create a shape
3. Release to finalize the shape

### Modifying Shapes

1. Click and drag a shape to move it
2. Use the corner handle (white circle) to resize
3. Shapes will snap to grid while moving/resizing

### Layer Visibility

1. Use the eye icon in the layer panel to toggle visibility
2. Only visible layers will be shown on the canvas

### Running DRC Checks

1. Click the "Run DRC" button in the DRC panel
2. View violations in the DRC panel
3. Violating shapes will be highlighted in red

### Zoom and Pan

- Use mouse wheel to zoom in/out
- Click and drag to pan the canvas
- Use zoom buttons in the top-right corner

## Project Structure

```
src/
├── components/
│   ├── LayoutEditor.jsx    # Main canvas for drawing and editing
│   ├── LayerPanel.jsx      # Sidebar for layer management
│   ├── DRCPanel.jsx        # Panel for DRC checks
│   └── Toolbar.jsx         # Top toolbar for tools
├── utils/
│   └── drcRules.js         # DRC rules and checks
└── App.jsx                 # Main application component
```

## Technical Details

### Grid System

- Grid spacing: 20px (1 lambda unit)
- Major grid lines: Every 5 lambda units
- All coordinates are snapped to grid

### Shape Properties

Each shape has:

- x, y: Position coordinates
- width, height: Dimensions
- layer: Associated layer type
- id: Unique identifier

### DRC Rules

- Minimum width checks
- Minimum spacing between shapes
- Enclosure rules for contacts

## Development

### Adding New Features

1. New layers can be added to `LAYER_COLORS` in LayoutEditor.jsx
2. DRC rules can be modified in drcRules.js
3. New tools can be added to Toolbar.jsx

### Common Issues

- Shapes not snapping to grid: Check `snapToGrid` function
- DRC violations not showing: Verify DRC rules and violation checks
- Layer visibility issues: Check layer state management

## Dependencies

- React
- Material-UI
- React-Konva
- React-DnD

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
