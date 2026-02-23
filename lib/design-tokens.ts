// Design tokens pour cohérence visuelle
export const colors = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e', // green-500
    600: '#16a34a',
    700: '#15803d',
  },
  secondary: {
    400: '#facc15', // yellow-400
    500: '#eab308',
    600: '#ca8a04',
  },
  accent: {
    500: '#ef4444', // red-500
    600: '#dc2626',
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    600: '#4b5563',
    900: '#111827',
  }
};

export const spacing = {
  section: 'py-16',
  sectionSm: 'py-12',
  container: 'container mx-auto px-4',
};

export const typography = {
  h1: 'text-4xl md:text-6xl font-bold',
  h2: 'text-3xl md:text-4xl font-bold',
  h3: 'text-2xl md:text-3xl font-bold',
  h4: 'text-xl md:text-2xl font-bold',
  body: 'text-base',
  small: 'text-sm',
};

export const animations = {
  transition: 'transition-all duration-300',
  hover: 'hover:scale-105 transition-transform',
  fadeIn: 'animate-fade-in',
};
