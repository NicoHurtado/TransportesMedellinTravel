# Medellín Travel - Premium Transportation Booking Platform

A modern, bilingual (ES/EN) Next.js application for booking premium transportation services in Medellín, Colombia.

## Features

- **Bilingual Support**: Seamless ES/EN language switching
- **Service Catalog**: Airport transfers, city tours, intercity travel, events, hourly services, and custom trips
- **Smart Booking Modal**: 4-step booking process with live vehicle illustration
- **Dynamic Vehicle Selection**: Automatically selects the appropriate vehicle (car, van, or bus) based on passenger count
- **Hotel Integration**: Special hotel code system for linked reservations
- **Modern UI/UX**: Black & white design with minimal yellow accents, inspired by Airbnb/Uber
- **Fully Responsive**: Mobile-first design that works on all devices
- **Accessible**: High contrast, visible focus states, and touch targets ≥44px

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Header
│   ├── page.tsx            # Home page with service catalog
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Fixed header with language toggle & hotel button
│   ├── HotelModal.tsx      # Hotel code input modal
│   ├── ServiceCard.tsx     # Service card component
│   ├── VehicleIllustration.tsx  # Dynamic vehicle display
│   └── BookingModal/
│       ├── index.tsx       # Main booking modal container
│       ├── StepIndicator.tsx    # Progress dots
│       ├── TripDetails.tsx      # Step 1: Origin, destination, date, time, passengers
│       ├── ContactInfo.tsx      # Step 2: Name, phone, email, contact preference
│       ├── NotesRecommendations.tsx  # Step 3: Notes & quick recommendations
│       ├── Summary.tsx          # Step 4: Invoice-style summary
│       └── Confirmation.tsx     # Success screen with tracking link
├── contexts/
│   └── LanguageContext.tsx # Language context & hook
└── lib/
    └── i18n.ts             # Translation strings (ES/EN)
```

## Design System

### Colors
- **White**: #FFFFFF (background, text on dark)
- **Black**: #0A0A0A (primary text, buttons)
- **Accent Yellow**: #F2C94C (minimal use - active step indicator, micro-dots)

### Typography
- **Font**: System sans-serif stack (Inter)
- **Headings**: Semibold (600)
- **Body**: Regular (400)

### Spacing & Borders
- **Border Radius**: 16-20px for cards and inputs
- **Shadows**: Subtle, natural shadows
- **Touch Targets**: Minimum 44px height for all interactive elements

## Key Features Explained

### Language Switching
Click the ES/EN toggle in the header to switch between Spanish and English. All UI text updates instantly using React Context.

### Hotel Integration
Hotels can enter their code via the "Soy Hotel / I'm a Hotel" button. Once linked, a notification badge appears in the header showing the connected hotel.

### Dynamic Vehicle Selection
The booking modal displays a vehicle illustration that automatically updates based on passenger count:
- **1-4 passengers**: Car
- **5-15 passengers**: Van
- **16+ passengers**: Bus

### Booking Flow
1. **Trip Details**: Enter origin, destination, date, time, and number of passengers
2. **Contact Info**: Provide name, WhatsApp, email, and contact preference
3. **Notes & Recommendations**: Add special requests (pets, seniors, child seat, luggage)
4. **Summary**: Review all details in an invoice-style format
5. **Confirmation**: Receive a tracking link to monitor reservation status

## Customization

### Adding New Services
Edit `src/app/page.tsx` and add a new service to the `services` array:

```typescript
{
  id: 'new-service',
  image: '🚗',
  titleKey: 'newService',
  descriptionKey: 'newServiceDesc',
}
```

Then add translations in `src/lib/i18n.ts`.

### Modifying Translations
All text is stored in `src/lib/i18n.ts`. Update the `translations` object with new keys or modify existing ones.

### Styling
Global styles are in `src/app/globals.css`. Component-specific styles use Tailwind CSS utility classes. The color palette is defined in `tailwind.config.ts`.

## Build for Production

```bash
npm run build
npm start
```

## Dashboard Operativo (/panel)

### Acceso

El dashboard operativo está disponible en:
```
http://localhost:3000/panel
```

**Credenciales de demo:**
- Contraseña: `medellin2025`

### Características del Dashboard

#### 🔐 Sistema de Autenticación
- Login con contraseña
- Sesión persistente en localStorage
- Protección de rutas

#### 📊 Vistas Disponibles

1. **Bandejas** (`/panel/dashboard`)
   - Gestión de reservas por estado
   - 7 estados: Pendiente por cotización, Por agendar, Agendado, Asignado, En ruta, Finalizado, Cancelado
   - Filtros rápidos: Hoy, Mañana, Esta semana
   - Cards compactas con toda la información
   - Panel lateral de detalle completo

2. **Calendario** (`/panel/dashboard/calendar`)
   - Vista día/semana/mes
   - Navegación por fechas
   - (En desarrollo)

3. **Estadísticas** (`/panel/dashboard/statistics`)
   - KPIs del mes
   - Gráficos de rendimiento
   - Métricas de conductores y aliados

4. **Base de Datos** (`/panel/dashboard/database`)
   - Tabla completa de reservas
   - Búsqueda global
   - Exportar a CSV
   - Filtros avanzados

5. **Aliados** (`/panel/dashboard/partners`)
   - Gestión de hoteles y Airbnbs
   - Códigos de acceso
   - Métricas por aliado
   - Reservas del mes

6. **Conductores** (`/panel/dashboard/drivers`)
   - Lista de conductores
   - Estado (Disponible/Ocupado/Inactivo)
   - Métricas de rendimiento
   - Vehículos asignados

7. **Ajustes** (`/panel/dashboard/settings`)
   - Configuración de textos y políticas
   - (En desarrollo)

#### 🎨 Diseño del Dashboard

- **Paleta monocroma:** Negro (#0A0A0A) y Blanco (#FFFFFF)
- **Acento amarillo mínimo:** #F2C94C solo en micro-indicadores
- **Layout responsive:** Sidebar colapsable en móvil
- **Header fijo:** Con búsqueda global, toggle de idioma y menú de usuario
- **Navegación clara:** 7 secciones principales

#### 📱 Funcionalidades

- **Datos de demostración:** 5 reservas, 3 conductores, 3 aliados
- **Panel de detalle:** Drawer lateral con información completa de cada reserva
- **Acciones rápidas:** Añadir cotización, asignar conductor, marcar completado
- **Timeline de estados:** Progreso visual de cada reserva
- **Bilingüe:** ES/EN en toda la interfaz

### Estructura del Dashboard

```
src/
├── app/panel/
│   ├── page.tsx                      # Login
│   └── dashboard/
│       ├── layout.tsx                # Layout con auth check
│       ├── page.tsx                  # Bandejas
│       ├── calendar/page.tsx         # Calendario
│       ├── statistics/page.tsx       # Estadísticas
│       ├── database/page.tsx         # Base de datos
│       ├── partners/page.tsx         # Aliados
│       ├── drivers/page.tsx          # Conductores
│       └── settings/page.tsx         # Ajustes
├── components/Dashboard/
│   ├── DashboardLayout.tsx           # Layout principal
│   ├── ReservationCard.tsx           # Card de reserva
│   └── ReservationDetail.tsx         # Panel de detalle
└── lib/
    └── mockData.ts                   # Datos de demostración
```

### Notas de Desarrollo

- El dashboard usa datos de demostración (mockData.ts)
- En producción, conectar con una API real
- El sistema de autenticación es básico (demo only)
- Para producción, implementar auth con JWT/sessions
- Las vistas de Calendario y algunos gráficos están como placeholders

## License

Private project for Medellín Travel.

