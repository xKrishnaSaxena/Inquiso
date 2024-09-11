export interface Question {
  _id: string;
  text: string;
  userName: string;
  votes: number;
}
export interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}
