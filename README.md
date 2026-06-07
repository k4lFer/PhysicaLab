# PhysicaLab ⚛️

Aplicación multiplataforma (iOS / Android / Web) de física interactiva con cálculos paso a paso y visualización 2D/3D. Construida con Expo + TypeScript + Clean Architecture.

## Stack

- **Framework:** [Expo](https://expo.dev) (SDK 52) + React Native
- **Lenguaje:** TypeScript
- **Navegación:** Expo Router (file-based routing)
- **Renderizado 3D (web):** Three.js + @react-three/fiber + @react-three/drei
- **Gráficos 2D:** react-native-svg
- **Fórmulas:** MathJax → SVG (react-native-svg)
- **Estado/Arquitectura:** Clean Architecture (domain / application / presentation)

## Estructura

```
src/
├── app/                  # Expo Router pages
│   ├── _layout.tsx       # Root layout
│   └── coulomb.tsx       # Coulomb calculator route
├── domain/
│   ├── entities/         # Domain models (Vector3, Charge)
│   └── calculators/      # Physics calculators (CoulombCalculator)
├── application/          # Use-cases
├── presentation/
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # Atomic components (Pill, Chip, Button, etc.)
│   │   ├── Graph2D.tsx   # 2D force graph (react-native-svg)
│   │   ├── Graph3D.tsx*  # 3D scene (native fallback)
│   │   ├── Graph3D.web.tsx  # 3D scene (Three.js / R3F)
│   │   ├── MathFormula.tsx  # LaTeX → SVG renderer
│   │   ├── StepLine.tsx  # Step-by-step formula display
│   │   └── ChargeCard.tsx # Charge input card
│   ├── hooks/            # Custom hooks (theme, coulomb state)
│   └── screens/          # Screen components
├── shared/               # Utilities (formatNum, etc.)
└── constants/            # Theme tokens, colors, spacing
```

## Requisitos

- [Bun](https://bun.sh) o Node.js ≥ 18
- Expo CLI (`bunx expo`)
- iOS: Xcode + CocoaPods
- Android: Android Studio
- Web: cualquier navegador moderno

## Desarrollo

```bash
bun install          # Instalar dependencias
bun run web          # Iniciar en navegador
bun run android      # Iniciar en Android
bun run ios          # Iniciar en iOS
```

## Build producción

```bash
npx expo export --platform web   # Web (static SPA)
npx expo build:android           # Android APK/AAB (EAS)
npx expo build:ios               # iOS IPA (EAS)
```

## Módulos

### Ley de Coulomb
- Cálculo de fuerza electrostática entre cargas puntuales
- Modos 2D (plano xy) y 3D (xyz)
- Paso a paso con fórmulas renderizadas en LaTeX
- Gráfica 2D vectorial (SVG)
- Gráfica 3D interactiva (web, Three.js)

## Theme

- Modo claro por defecto con toggle manual (🌙/☀️)
- Paleta limpia sin colores neón: azul (#2563eb) como accent
- Adaptación a sistema (opcional, forzable manualmente)
