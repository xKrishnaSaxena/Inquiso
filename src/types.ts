export interface Question {
  _id: string;
  text: string;
  userName: string;
  votes: number;
}
export interface User {
  _id: string;
  email: string;
  username: string;
}
export interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}
