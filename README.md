# PhysicaLab ⚛️

Aplicación multiplataforma (iOS / Android / Web) de física interactiva con cálculos paso a paso y visualización 2D/3D. Construida con Expo + TypeScript + Clean Architecture.
---

## Stack

- **Framework:** [Expo](https://expo.dev) (SDK 52) + React Native
- **Lenguaje:** TypeScript
- **Navegación:** Expo Router (file-based routing)
- **Renderizado 3D (web):** Three.js + @react-three/fiber + @react-three/drei
- **Gráficos 2D:** react-native-svg
- **Fórmulas:** MathJax → SVG (react-native-svg)
- **Estado/Arquitectura:** Clean Architecture (domain / application / presentation)

---

## Arquitectura del Software

El proyecto sigue **Clean Architecture** en 3 capas, separando responsabilidades de forma clara:

```mermaid
---
title: Arquitectura — PhysicaLab (Clean Architecture)
---
graph TB
  subgraph UI["📱 CAPA DE PRESENTACIÓN"]
    direction TB
    A["app/ (Expo Router)"] --> B["screens/ (CoulombScreen, HomeScreen)"]
    B --> C["components/ (ChargeCard, Graph2D, Graph3D, StepLine)"]
    B --> D["hooks/ (useCoulomb, usePhysicsTheme)"]
    C --> E["ui/ (Button, Pill, Chip, NumericInput)"]
  end

  subgraph APP["⚙️ CAPA DE APLICACIÓN"]
    direction TB
    F["CalculateForce.ts"]
    G["CalculateElectricField.ts"]
    H["CalculatePotential.ts"]
  end

  subgraph DOMAIN["🧠 CAPA DE DOMINIO"]
    direction TB
    I["entities/ (Charge.ts, Vector3.ts)"]
    J["calculators/ (CoulombCalculator.ts)"]
  end

  subgraph SHARED["🔧 CAPA COMPARTIDA"]
    direction TB
    K["constants/theme.ts"]
    L["shared/format.ts"]
    M["assets/, public/"]
  end

  UI --> APP
  APP --> DOMAIN
  DOMAIN --> SHARED
```

📐 [`docs/arquitectura.mermaid`](docs/arquitectura.mermaid)

### Flujo de datos

1. **Usuario** ingresa cargas y selecciona modo (2D/3D) en la UI
2. **CoulombScreen** (presentación) llama a `useCoulomb` (hook)
3. **useCoulomb** invoca `CalculateForce` (caso de uso en capa de aplicación)
4. **CalculateForce** valida datos y delega en `CoulombCalculator` (dominio)
5. **CoulombCalculator** aplica la Ley de Coulomb y principio de superposición
6. **Resultado** retorna a la UI: pasos (LaTeX), vectores, gráficas

---

## Diagrama de Flujo — Cálculo de Fuerza Neta

Este diagrama describe el algoritmo implementado en `CoulombCalculator.ts`:

```mermaid
---
title: Flujo de Cálculo — Ley de Coulomb (PhysicaLab)
---
flowchart LR
  subgraph Entrada["① ENTRADA"]
    direction TB
    A0["Seleccionar modo<br>2D / 3D"] --> A1
    A1["Agregar cargas<br>qᵢ (nC), xᵢ yᵢ (cm)<br>zᵢ (cm) si 3D"] --> A2
    A2["Seleccionar<br>carga objetivo Q"]
  end

  subgraph Validacion["② VALIDACIÓN"]
    direction TB
    B1{"¿n ≥ 2?"}
    B1 -- Sí --> B2
    B1 -- No --> B99["⛔ Error:<br>min 2 cargas"]
    B2{"¿Objetivo<br>válido?"}
    B2 -- Sí --> B3
    B2 -- No --> B99
    B3{"¿r ≠ 0 para<br>todo par?"}
    B3 -- Sí --> C
    B3 -- No --> B98["⛔ Error:<br>cargas superpuestas"]
  end

  subgraph Calculo["③ CÁLCULO (por cada fuente i)"]
    direction TB
    C["Δr = rⱼ − rᵢ"] --> D
    D["r = √(Δx² + Δy² + Δz²)"] --> E
    E["r̂ = Δr / r"] --> F
    F["F = k · |qᵢ| · |Q| / r²"] --> G
    G["signo = sign(qᵢ · Q)<br>↳ atractiva / repulsiva"] --> H
    H["Fᵢ = signo · F · r̂<br>Fxᵢ, Fyᵢ, Fzᵢ"] --> I
    I["Fₙₑₜₐ += Fᵢ<br>(superposición)"]
  end

  subgraph Resultado["④ RESULTADO"]
    direction TB
    J["|Fₙₑₜₐ| = √(Fx² + Fy² + Fz²)"] --> K
    K["θ = atan2(Fy, Fx)<br>φ = atan2(Fz, √(Fx²+Fy²))"] --> L
    L["Mostrar vector,<br>magnitud y ángulos"]
  end

  subgraph Visualizacion["⑤ VISUALIZACIÓN"]
    direction TB
    M["Paso a paso<br>(LaTeX)"]
    N["Gráfica 2D<br>(SVG)"]
    O["Gráfica 3D<br>(Three.js)"]
  end

  Entrada --> Validacion
  Validacion --> Calculo
  Calculo --> Resultado
  Resultado --> Visualizacion
```

🔀 [`docs/flujo-calculo-fuerza.mermaid`](docs/flujo-calculo-fuerza.mermaid)

---

## Estructura del Proyecto

```
src/
├── app/                      # Expo Router pages
│   ├── _layout.tsx           # Root layout con Stack navigator
│   ├── index.tsx             # Página de inicio (HomeScreen)
│   └── coulomb.tsx           # Ruta del calculador de Coulomb
├── domain/                   # 🧠 Capa de dominio (reglas de negocio)
│   ├── entities/
│   │   ├── Charge.ts         # Modelo de carga puntual (id, q, x, y, z)
│   │   └── Vector3.ts        # Álgebra vectorial 3D (suma, resta, norma, unitario)
│   └── calculators/
│       ├── CoulombCalculator.ts  # ⚡ Implementación de la Ley de Coulomb
│       ├── ElectricFieldCalculator.ts
│       └── PotentialCalculator.ts
├── application/              # ⚙️ Casos de uso
│   ├── CalculateForce.ts     # Orquestador: valida entrada y llama al cálculo
│   ├── CalculateElectricField.ts
│   └── CalculatePotential.ts
├── presentation/             # 📱 Interfaz de usuario
│   ├── components/
│   │   ├── ui/               # Componentes atómicos (Button, Pill, Chip, etc.)
│   │   ├── Graph2D.tsx       # Gráfico de fuerzas 2D (SVG interactivo)
│   │   ├── Graph3D.tsx       # Gráfico 3D isométrico (SVG nativo)
│   │   ├── Graph3D.web.tsx   # Gráfico 3D interactivo (Three.js)
│   │   ├── Graph3DNative.tsx # Fallback nativo para 3D
│   │   ├── MathFormula.tsx   # Renderizador LaTeX → SVG
│   │   ├── StepLine.tsx      # Visualización de paso a paso
│   │   └── ChargeCard.tsx    # Tarjeta de entrada de carga
│   ├── hooks/
│   │   ├── useCoulomb.ts     # Estado y lógica del calculador
│   │   ├── usePhysicsTheme.ts
│   │   └── useThemeMode.tsx
│   └── screens/
│       ├── HomeScreen.tsx    # Pantalla de inicio con lista de módulos
│       └── CoulombScreen.tsx # Pantalla principal del calculador
├── shared/                   # 🔧 Utilidades compartidas
│   ├── constants.ts          # Constantes físicas (k, colores, subíndices)
│   └── format.ts             # Formateo de números, cargas, distancias
├── constants/
│   └── theme.ts              # Tokens de tema (colores, fuentes, espaciado)
├── assets/                   # Imágenes, fuentes, iconos
├── public/                   # Archivos estáticos web (sw.js, manifest.json)
├── docs/                     # Documentación
│   ├── arquitectura.mermaid  # Diagrama de arquitectura
│   └── flujo-calculo-fuerza.mermaid  # Diagrama de flujo Coulomb
└── global.css                # Estilos globales
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
- Gráfica 2D vectorial (SVG) interactiva con zoom/arrastre
- Gráfica 3D interactiva (web, Three.js con OrbitControls)

## Theme

- Modo claro/oscuro con toggle manual (🌙/☀️)
- Paleta limpia: azul (#2563eb) como accent
- Rojo para cargas positivas, azul para negativas


