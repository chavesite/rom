export interface BackgroundTheme {
  id: string;
  name: string;
  color: string;
}

// Temas de cor de fundo da loja (tons claros, para manter os textos legíveis).
export const BACKGROUND_THEMES: BackgroundTheme[] = [
  { id: 'padrao', name: 'Padrão (cinza claro)', color: '#f9fafb' },
  { id: 'rosa', name: 'Rosa suave', color: '#fdf2f8' },
  { id: 'lavanda', name: 'Lavanda', color: '#f5f3ff' },
  { id: 'azul', name: 'Azul céu', color: '#f0f9ff' },
  { id: 'menta', name: 'Menta', color: '#ecfdf5' },
  { id: 'pessego', name: 'Pêssego', color: '#fff7ed' },
  { id: 'creme', name: 'Creme', color: '#fefce8' },
  { id: 'branco', name: 'Branco', color: '#ffffff' },
];

export const DEFAULT_THEME_ID = 'padrao';

export const getThemeColor = (id?: string) =>
  (BACKGROUND_THEMES.find((t) => t.id === id) ?? BACKGROUND_THEMES[0]).color;
