export type Language = 'es' | 'en';

export const translations = {
  es: {
    // Header
    hotel: 'Soy Hotel',
    hotelLogin: 'Ingresar como hotel',
    hotelLinked: 'Reserva vinculada a',
    
    // Home
    book: 'Reservar',
    ourServices: 'Nuestros servicios',
    bookNow: 'Reserva ahora',
    serviceDescription: 'Elige tu servicio y reserva rápido y fácil',
    
    // Services
    airportTransfer: 'Transporte Aeropuerto',
    airportTransferDesc: 'Traslados privados desde/hacia los aeropuertos de Medellín (EOH) y Rionegro (MDE), con recogida puntual y seguimiento básico del vuelo.',
    guatapeTour: 'Tour a Guatapé',
    guatapeTourDesc: 'Excursión de día completo al oriente antioqueño con visita al embalse, pueblo de colores y posibilidad de subir la Piedra del Peñol.',
    graffitiTour: 'Tour Graffity & Comuna 13',
    graffitiTourDesc: 'Recorrido cultural por murales, escaleras eléctricas y miradores de la Comuna 13, guiado por locales.',
    haciendaNapolesTour: 'Tour Hacienda Nápoles',
    haciendaNapolesTourDesc: 'Viaje de día completo al parque temático en Puerto Triunfo, con atracciones de fauna, acuáticas y museo.',
    parapenteTour: 'Tour Parapente',
    parapenteTourDesc: 'Experiencia de vuelo en tándem con operadores certificados en zonas cercanas a Medellín; incluye transporte ida y regreso.',
    cityTour: 'City Tour',
    cityTourDesc: 'Visita guiada por los principales puntos de interés de Medellín (centro, Pueblito Paisa, parques y miradores); modalidad por horas.',
    jardinTour: 'Tour Jardín Antioquia',
    jardinTourDesc: 'Salida al suroeste antioqueño para conocer uno de los pueblos más bellos de Colombia, calles empedradas y cafetales.',
    occidenteTour: 'Tour Occidente',
    occidenteTourDesc: 'Ruta hacia el occidente antioqueño (p. ej., Santa Fe de Antioquia y sus puentes coloniales) con paradas panorámicas.',
    customTransport: 'Transporte personalizado',
    customTransportDesc: 'Servicios a medida (múltiples paradas, destinos fuera de lista, horarios especiales) según necesidad del cliente. Reservas, recomendaciones personalizadas, logística puerta a puerta y atención prioritaria.',
    
    // Modal steps
    next: 'Siguiente',
    back: 'Atrás',
    confirm: 'Confirmar',
    
    // Section 1: Trip
    from: 'Origen',
    to: 'Destino',
    date: 'Fecha',
    time: 'Hora',
    passengers: 'Número de personas',
    fromPlaceholder: 'Ej: Aeropuerto José María Córdova o Hotel Diez',
    toPlaceholder: 'Ej: Hotel Poblado Plaza o C.C. Oviedo',
    tip: 'Escribe un lugar reconocible.',
    
    // Airport Transfer
    airportTransportTitle: 'Transporte Aeropuerto',
    toAirport: 'Hacia el aeropuerto',
    fromAirport: 'Desde el aeropuerto',
    selectAirport: 'Selecciona el aeropuerto',
    selectAirportAbove: 'Selecciona el aeropuerto arriba',
    airportDirectionQuestion: '¿Hacia el aeropuerto o desde el aeropuerto?',
    airportJMC: 'José María Córdova',
    airportJMCSub: 'Rionegro (MDE)',
    airportOlaya: 'Olaya Herrera',
    airportOlayaSub: 'Medellín (EOH)',
    flightNumber: 'Número de vuelo',
    flightNumberPlaceholder: 'Ej: AV8522, LA1234',
    
    // Custom Transport
    hoursNeeded: '¿Cuántas horas necesitas disponibilidad de Transporte?',
    hoursNeededPlaceholder: 'Ej: 4, 6, 8 horas',
    hours: 'horas',
    
    // Section 2: Contact
    name: 'Nombre',
    whatsapp: 'WhatsApp',
    email: 'Correo',
    emailConfirmation: 'Se te enviará una confirmación a tu correo electrónico.',
    namePlaceholder: 'Tu nombre completo',
    whatsappPlaceholder: '+57 300 123 4567',
    emailPlaceholder: 'correo@ejemplo.com',
    confirmationMessage: 'Te hemos enviado un mensaje a tu correo electrónico con los detalles de tu reserva.',
    contactPreference: 'Preferencia de contacto',
    
    // Section 3: Notes
    notesTitle: 'Notas y Recomendaciones',
    additionalNotes: 'Nota adicional',
    notesPlaceholder: 'Algún detalle importante que debamos saber...',
    quickRecommendations: 'Recomendaciones rápidas',
    pets: 'Llevo mascotas',
    seniors: 'Personas adultas mayores',
    childSeat: 'Silla para bebé',
    extraLuggage: 'Equipaje extra',
    none: 'Ninguna',
    priceNote: 'Estas opciones no cambian el precio automáticamente; nos ayudan a coordinar tu viaje.',
    
    // Section 4: Summary
    summaryTitle: 'Resumen de Reserva',
    service: 'SERVICIO',
    origin: 'Origen',
    destination: 'Destino',
    dateTime: 'Fecha y Hora',
    vehicle: 'Vehículo',
    contact: 'Contacto',
    quote: 'Cotización',
    quotePending: 'Pendiente por cotización',
    cancellationPolicy: 'Política de cancelación: Puedes cancelar hasta 24h antes sin cargo.',
    
    // Confirmation
    requestSubmitted: '¡Solicitud enviada!',
    contactSoon: 'Te contactaremos pronto para confirmar tu reserva.',
    trackingLink: 'Link de seguimiento',
    viewStatus: 'Ver estado',
    backHome: 'Volver al inicio',
    
    // Hotel modal
    hotelCodeTitle: 'Código de Hotel',
    hotelCodePlaceholder: 'Ingresa tu código de hotel',
    link: 'Vincular',
    close: 'Cerrar',
    
    // Vehicle types
    car: 'Auto',
    van: 'Van',
    bus: 'Bus',
    passengersLabel: 'pasajeros',
    
    // Dashboard
    operationTitle: 'Operación de Transportes',
    profile: 'Perfil',
    help: 'Ayuda',
    logout: 'Salir',
    search: 'Buscar...',
    
    // Sidebar
    trays: 'Bandejas',
    calendar: 'Calendario',
    statistics: 'Estadísticas',
    database: 'Base de datos',
    partners: 'Aliados',
    drivers: 'Conductores',
    settings: 'Ajustes',
    
    // Status
    toBeQuoted: 'Pendiente por cotización',
    toSchedule: 'Por agendar',
    scheduled: 'Agendado',
    assigned: 'Asignado',
    onTheWay: 'En ruta',
    completed: 'Finalizado',
    cancelled: 'Cancelado',
    
    // Actions
    addQuote: 'Añadir cotización',
    assignDriver: 'Asignar conductor',
    edit: 'Editar',
    reschedule: 'Reprogramar',
    markCompleted: 'Marcar completado',
    cancel: 'Cancelar',
    save: 'Guardar',
    
    // Filters
    today: 'Hoy',
    tomorrow: 'Mañana',
    thisWeek: 'Esta semana',
    channel: 'Canal',
    partner: 'Aliado',
    driver: 'Conductor',
    status: 'Estado',
    
    // Table
    code: 'Código',
    customer: 'Cliente',
    
    // Login
    loginTitle: 'Acceso al Panel',
    password: 'Contraseña',
    login: 'Ingresar',
    invalidPassword: 'Contraseña incorrecta',
  },
  en: {
    // Header
    hotel: "I'm a Hotel",
    hotelLogin: 'Hotel login',
    hotelLinked: 'Reservation linked to',
    
    // Home
    book: 'Book',
    ourServices: 'Our services',
    bookNow: 'Book now',
    serviceDescription: 'Choose your service and book quickly and easily',
    
    // Services
    airportTransfer: 'Airport Transport',
    airportTransferDesc: 'Private transfers from/to Medellín airports (EOH) and Rionegro (MDE), with punctual pickup and basic flight tracking.',
    guatapeTour: 'Guatapé Tour',
    guatapeTourDesc: 'Full-day excursion to eastern Antioquia with visit to the reservoir, colorful town, and possibility to climb the Peñol Rock.',
    graffitiTour: 'Graffiti & Comuna 13 Tour',
    graffitiTourDesc: 'Cultural tour through murals, electric escalators and viewpoints of Comuna 13, guided by locals.',
    haciendaNapolesTour: 'Hacienda Nápoles Tour',
    haciendaNapolesTourDesc: 'Full-day trip to the theme park in Puerto Triunfo, with wildlife, water attractions and museum.',
    parapenteTour: 'Paragliding Tour',
    parapenteTourDesc: 'Tandem flight experience with certified operators in areas near Medellín; includes round-trip transportation.',
    cityTour: 'City Tour',
    cityTourDesc: 'Guided tour of the main points of interest in Medellín (downtown, Pueblito Paisa, parks and viewpoints); hourly service.',
    jardinTour: 'Jardín Antioquia Tour',
    jardinTourDesc: 'Trip to southwestern Antioquia to discover one of the most beautiful towns in Colombia, cobblestone streets and coffee plantations.',
    occidenteTour: 'Occidente Tour',
    occidenteTourDesc: 'Route to western Antioquia (e.g., Santa Fe de Antioquia and its colonial bridges) with panoramic stops.',
    customTransport: 'Custom Transport',
    customTransportDesc: 'Tailored services (multiple stops, destinations not on the list, special schedules) according to customer needs. Reservations, personalized recommendations, door-to-door logistics and priority attention.',
    
    // Modal steps
    next: 'Next',
    back: 'Back',
    confirm: 'Confirm',
    
    // Section 1: Trip
    from: 'From',
    to: 'To',
    date: 'Date',
    time: 'Time',
    passengers: 'Number of passengers',
    fromPlaceholder: 'E.g.: José María Córdova Airport or Hotel Diez',
    toPlaceholder: 'E.g.: Poblado Plaza Hotel or Oviedo Shopping Center',
    tip: 'Enter a recognizable place.',
    
    // Airport Transfer
    airportTransportTitle: 'Airport Transport',
    toAirport: 'To the airport',
    fromAirport: 'From the airport',
    selectAirport: 'Select the airport',
    selectAirportAbove: 'Select the airport above',
    airportDirectionQuestion: 'To the airport or from the airport?',
    airportJMC: 'José María Córdova',
    airportJMCSub: 'Rionegro (MDE)',
    airportOlaya: 'Olaya Herrera',
    airportOlayaSub: 'Medellín (EOH)',
    flightNumber: 'Flight number',
    flightNumberPlaceholder: 'E.g.: AV8522, LA1234',
    
    // Custom Transport
    hoursNeeded: 'How many hours do you need transport availability?',
    hoursNeededPlaceholder: 'E.g.: 4, 6, 8 hours',
    hours: 'hours',
    
    // Section 2: Contact
    name: 'Name',
    whatsapp: 'Phone',
    email: 'Email',
    emailConfirmation: 'A confirmation will be sent to your email address.',
    namePlaceholder: 'Your full name',
    whatsappPlaceholder: '+57 300 123 4567',
    emailPlaceholder: 'email@example.com',
    confirmationMessage: 'We have sent a message to your email with your reservation details.',
    contactPreference: 'Preferred contact',
    
    // Section 3: Notes
    notesTitle: 'Notes & Recommendations',
    additionalNotes: 'Additional notes',
    notesPlaceholder: 'Any important detail we should know...',
    quickRecommendations: 'Quick recommendations',
    pets: "I'm traveling with pets",
    seniors: 'Seniors onboard',
    childSeat: 'Child seat needed',
    extraLuggage: 'Extra luggage',
    none: 'None',
    priceNote: "These options don't change the price automatically; they help us coordinate your ride.",
    
    // Section 4: Summary
    summaryTitle: 'Reservation Summary',
    service: 'SERVICE',
    origin: 'Origin',
    destination: 'Destination',
    dateTime: 'Date & Time',
    vehicle: 'Vehicle',
    contact: 'Contact',
    quote: 'Quote',
    quotePending: 'Quote pending',
    cancellationPolicy: 'Cancellation policy: You can cancel up to 24h before without charge.',
    
    // Confirmation
    requestSubmitted: 'Request submitted!',
    contactSoon: 'We will contact you soon to confirm your reservation.',
    trackingLink: 'Tracking link',
    viewStatus: 'View status',
    backHome: 'Back to home',
    
    // Hotel modal
    hotelCodeTitle: 'Hotel Code',
    hotelCodePlaceholder: 'Enter your hotel code',
    link: 'Link',
    close: 'Close',
    
    // Vehicle types
    car: 'Car',
    van: 'Van',
    bus: 'Bus',
    passengersLabel: 'passengers',
    
    // Dashboard
    operationTitle: 'Transport Operations',
    profile: 'Profile',
    help: 'Help',
    logout: 'Logout',
    search: 'Search...',
    
    // Sidebar
    trays: 'Trays',
    calendar: 'Calendar',
    statistics: 'Statistics',
    database: 'Database',
    partners: 'Partners',
    drivers: 'Drivers',
    settings: 'Settings',
    
    // Status
    toBeQuoted: 'To be quoted',
    toSchedule: 'To schedule',
    scheduled: 'Scheduled',
    assigned: 'Assigned',
    onTheWay: 'On the way',
    completed: 'Completed',
    cancelled: 'Canceled',
    
    // Actions
    addQuote: 'Add quote',
    assignDriver: 'Assign driver',
    edit: 'Edit',
    reschedule: 'Reschedule',
    markCompleted: 'Mark completed',
    cancel: 'Cancel',
    save: 'Save',
    
    // Filters
    today: 'Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    channel: 'Channel',
    partner: 'Partner',
    driver: 'Driver',
    status: 'Status',
    
    // Table
    code: 'Code',
    customer: 'Customer',
    
    // Login
    loginTitle: 'Panel Access',
    password: 'Password',
    login: 'Login',
    invalidPassword: 'Invalid password',
  },
};

export type TranslationKey = keyof typeof translations.es;
