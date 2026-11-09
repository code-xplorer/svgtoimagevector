# SVG to Jetpack Compose ImageVector Studio

A fast, lightweight developer studio designed for Android and Compose Multiplatform engineers to upload any SVG vector graphic and immediately generate production-ready, idiomatic Jetpack Compose `ImageVector` Kotlin source code.

Built with **React 18**, **TypeScript**, and **Pure CSS (Material Design 3)**, ready to be hosted directly on **GitHub Pages** as a static site.

---

## 🚀 Key Features

### 1. Instant SVG Ingestion & Parsing
- **Drag & Drop**: Drop any `.svg` file directly into the drop zone.
- **File Browser**: Click anywhere on the drop card to choose a file.
- **Raw XML Code Paste**: Paste raw SVG XML code with instant DOM validation and error feedback.
- **Sample Vector Gallery**: Built-in sample vectors (Gradient Star, Android Bot, Cyber Orb, Compose Emblem, Verified Badge with EvenOdd fill, Heart Pulse) for quick testing.
- **Comprehensive SVG Support**:
  - Full path commands: `M/m`, `L/l`, `H/h`, `V/v`, `C/c`, `S/s`, `Q/q`, `T/t`, `A/a`, `Z/z`.
  - Geometric primitives: `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<polygon>`, `<polyline>`.
  - Grouping and hierarchy: `<g>` groups, `<defs>`, and nested child paths.
  - Transforms: `transform="matrix(...) translate(...) rotate(...) scale(...)"`.
  - Fill rules: `fill-rule="nonzero"` and `fill-rule="evenodd"`.
  - Gradients: `<linearGradient>` and `<radialGradient>` with multiple stops and color offsets.
  - Strokes: stroke color, stroke width, stroke opacity, line caps (`butt`, `round`, `square`), and line joins (`miter`, `round`, `bevel`).

### 2. Live Vector Preview
- **Interactive Backgrounds**: Toggle between Checkerboard (transparency), Light, Dark, and Grid patterns.
- **Precision Zoom**: Zoom In (+), Zoom Out (-), 100% Reset, and Fit-to-Frame.
- **Metadata Chips**: Real-time display of viewBox coordinates, shape/path count, gradient count, and fill rules.

### 3. Jetpack Compose ImageVector Code Generation
- Generates clean, idiomatic, copy-pasteable Kotlin code for Android and Compose Multiplatform:
  - **Material Icon Style (Cached Property)**: `public val MyIcon: ImageVector get() = ...` with cached `_myIcon` backing field.
  - **Composable Remember**: `@Composable fun rememberMyIcon(): ImageVector`.
  - **Lazy Val Property**: `public val MyIcon: ImageVector by lazy { ... }`.
  - **Builder Only**: Raw `ImageVector.Builder(...)` block.
- **Configurable Generator Options**:
  - Custom Icon Identifier name (auto-sanitized for valid Kotlin PascalCase identifier).
  - Custom Package Name (e.g. `com.example.ui.icons`).
  - Toggle Package & Import declarations generation.
- **Export & Clipboard**:
  - 1-click **Copy to Clipboard** with visual confirmation checkmark.
  - 1-click **Download `.kt`** source file.
  - Clean SVG export tab and **Download `.svg`**.

---

## 🛠️ Tech Stack & Coding Standards

- **React 18 + TypeScript**: Type-safe component architecture.
- **Pure CSS (No Tailwind)**:
  - Material Design 3 design system tokens (`--md-sys-color-*`, `--md-sys-elevation-*`, `--md-sys-shape-corner-*`).
  - Native CSS Variables for dynamic Light/Dark theme switching.
  - Responsive 2-column layout with flexible side-by-side viewports.
- **SOLID Architecture**:
  - `src/core/parser/`: Dedicated parser subsystem for SVGs and SVG path strings (`d` attribute).
  - `src/core/generator/`: Dedicated generators for Kotlin `ImageVector` code and cleaned SVG markup.
  - `src/core/geometry/`: Mathematical utilities for Bezier curves and transform matrix operations.
  - `src/hooks/useConverterState.ts`: Single source of truth managing converter document state and generation options.
  - `src/components/`: Modular components (Header, SvgUploadCard, SvgPreviewCard, ImageVectorPanel, Modals).

---

## 📁 Package / Folder Structure

```
src/
├── assets/
│   └── samples.ts               # Curated sample SVGs (linear & radial gradients, evenodd, etc.)
├── components/
│   ├── codegen/
│   │   ├── ImageVectorPanel.tsx # Code generation panel, options bar & export controls
│   │   └── KotlinHighlighter.tsx# Zero-dependency Kotlin & XML syntax highlighter
│   ├── common/
│   │   ├── ColorPicker.tsx      # MD3 color palette selector
│   │   └── IconButton.tsx       # MD3 icon button
│   ├── layout/
│   │   ├── Header.tsx           # Top navigation bar with branding & quick actions
│   │   └── MainLayout.tsx       # 2-column responsive layout orchestrator
│   ├── modals/
│   │   ├── PasteSvgModal.tsx    # Raw SVG XML paste & convert modal
│   │   ├── SampleGalleryModal.tsx # Visual gallery to choose test vectors
│   │   └── SvgUploadModal.tsx   # File picker & drop dialog
│   ├── preview/
│   │   └── SvgPreviewCard.tsx   # Interactive SVG preview with backgrounds & zoom
│   └── upload/
│       └── SvgUploadCard.tsx    # Drag-and-drop card & quick sample pills
├── core/
│   ├── generator/
│   │   ├── imageVectorGenerator.ts # Kotlin Jetpack Compose ImageVector DSL generator
│   │   └── svgGenerator.ts      # Clean SVG serializer
│   ├── geometry/
│   │   ├── bezier.ts            # Curve math & shape-to-path conversions
│   │   └── matrix.ts            # 2D transform matrix math
│   └── parser/
│       ├── pathParser.ts        # SVG path data (d) parser into path commands
│       └── svgParser.ts         # Full SVG XML DOM parser
├── hooks/
│   └── useConverterState.ts     # Unified converter state hook
├── styles/
│   ├── converter.css            # Upload, Preview, Codegen, and Syntax styles
│   ├── layout.css               # Header & 2-column workspace layout
│   ├── main.css                 # Base resets, typography, scrollbars
│   ├── modal.css                # MD3 modal dialogs and backdrop
│   └── theme.css                # Material Design 3 design tokens (Light/Dark)
├── types/
│   ├── editor.ts                # UI & tool state definitions
│   ├── imagevector.ts          # Jetpack Compose generation options
│   └── vector.ts                # VectorDocument and AST definitions
├── App.tsx                      # Root App component
├── main.tsx                     # React entrypoint
└── vite.config.ts               # Vite configuration with relative base './'
```

---

## 💻 Getting Started Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Build for GitHub Pages production**:
   ```bash
   npm run build
   ```
   The production-ready assets are placed into the `dist/` directory with relative links (`base: './'`), ready to be pushed to any branch or static host.
