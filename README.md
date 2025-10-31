# Arkcom AI Browser

An AI-powered search and chat assistant integrated into a browser-like interface. It provides instant, 
context-aware results using the Gemini API and Google Search, 
offering a conversational and intelligent browsing experience.

## Features

-   **Intelligent Chat**: Engage in dynamic, context-aware conversations with advanced AI models from Google's Gemini family (`gemini-2.5-flash` and `gemini-2.5-pro`).
-   **Web-Grounded Answers**: Toggle Google Search integration to get up-to-date information from the web, complete with cited sources.
-   **Image Understanding**: Attach images to your prompts for visual Q&A, analysis, and multimodal interaction.
-   **Voice-to-Text**: Use your microphone for hands-free input, making it easier to ask questions and dictate messages.
-   **AI Text Enhancement**: Instantly improve the clarity, detail, and professionalism of your writing with a single click using the "Wand" tool.
-   **Persistent History**: Your conversations are automatically saved to your browser's local storage for easy access and resumption.
-   **Dual Themes**: Seamlessly switch between a sleek dark mode and a clean light mode to suit your preference.
-   **Modular Pages**: Explore different content areas beyond the main chat:
    -   **Discover**: Find trending topics and AI prompt starters.
    -   **Spaces**: (Conceptual) Organize chats and projects into collaborative spaces.
    -   **Finance**: Get a market snapshot and ask AI financial questions.
-   **Responsive Design**: A fluid interface that works beautifully across different screen sizes.

## Tech Stack

-   **Frontend**: React, TypeScript
-   **AI Engine**: Google Gemini API (`@google/genai`)
-   **Styling**: Tailwind CSS
-   **State Management**: React Hooks (`useState`, `useEffect`, `useContext`)
-   **Icons**: Custom-built SVG components for a consistent look and feel.
-   **Modules**: ES6 modules with an `importmap` for dependency management directly in the browser.

## Getting Started

### Prerequisites

This project is designed to run in a modern browser environment that supports ES6 modules and `importmap`. 
A local web server is recommended for development to handle module resolution correctly.

### Environment Variables

The application requires a Google Gemini API key to function. This key must be available as an environment variable named `API_KEY`.

```
API_KEY="YOUR_GEMINI_API_KEY"
```

In the intended runtime environment, this variable is expected to be securely injected.

### Running the Application

1.  **Serve the project directory:**
    You can use any simple local web server. A popular choice is `serve`.
    ```bash
    # Install serve globally if you haven't already
    npm install -g serve

    # Run the server from the project's root directory
    serve .
    ```

2.  **Open in your browser:**
    Navigate to the local address provided by the server (e.g., `http://localhost:3000`).

## File Structure

The project is organized into a modular and maintainable structure:

```
.
├── components/          # Reusable React components
│   ├── icons/           # SVG icon components
│   ├── ChatLimitModal.tsx # Modal for chat history limit
│   ├── ChatView.tsx     # The main chat interface
│   └── Sidebar.tsx      # Navigation and chat history sidebar
├── contexts/            # React Context for global state
│   └── ThemeContext.tsx # Manages light/dark theme
├── pages/               # Page-level components
│   ├── DiscoverPage.tsx # Discover section
│   ├── FinancePage.tsx  # Finance section
│   └── SpacesPage.tsx   # Spaces section
├── services/            # Services for external APIs
│   └── geminiService.ts # Logic for interacting with the Gemini API
├── App.tsx              # Main application component, handles layout and routing
├── index.html           # The single HTML entry point for the app
├── index.tsx            # The root React component renderer
├── metadata.json        # Application metadata and permissions
├── README.md            # Project documentation (this file)
└── types.ts             # TypeScript type definitions and interfaces
```
