import { Chat } from '@google/genai';

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface AttachedImage {
  mimeType: string;
  data: string; // base64
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: AttachedImage;
  sources?: GroundingSource[];
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  model: string;
}

export interface ChatViewProps {
    messages: ChatMessage[];
    onSaveMessage: (userMessage: ChatMessage, modelMessage: ChatMessage) => void;
    onUpdateMessageChunk: (chunk: string, sources?: GroundingSource[]) => void;
    selectedModel: string;
    onSetSelectedModel: (model: string) => void;
}

export type Page = 'Home' | 'Discover' | 'Spaces' | 'Finance';

export interface SidebarProps {
    history: ChatSession[];
    activeId: string | null;
    onNewChat: () => void;
    onSelectChat: (id: string) => void;
    onDeleteChat: (id: string) => void;
    activePage: Page;
    onSelectPage: (page: Page) => void;
}

export interface ChatLimitModalProps {
  onSave: () => void;
  onDelete: () => void;
}

export interface GeminiService {
  startChat: (history: ChatMessage[], model: string, useGoogleSearch: boolean) => Promise<Chat | null>;
  sendMessage: (
    chat: Chat,
    message: string,
    image: AttachedImage | null,
    onChunk: (chunk: string) => void,
    onSources: (sources: GroundingSource[]) => void
  ) => Promise<string>;
  enhanceText: (text: string) => Promise<string>;
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}