import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ChatLimitModal from './components/ChatLimitModal';
import { useTheme } from './contexts/ThemeContext';
import type { ChatSession, ChatMessage, Page } from './types';
import { v4 as uuidv4 } from 'uuid';
import DiscoverPage from './pages/DiscoverPage';
import SpacesPage from './pages/SpacesPage';
import FinancePage from './pages/FinancePage';

const App: React.FC = () => {
  const { theme } = useTheme();
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [activePage, setActivePage] = useState<Page>('Home');

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('arkcom_chat_history');
      if (storedHistory) {
        const parsedHistory: ChatSession[] = JSON.parse(storedHistory);
        setChatHistory(parsedHistory);
        if (parsedHistory.length > 0) {
          setActiveChatId(parsedHistory[0].id);
        } else {
          handleNewChat();
        }
      } else {
        handleNewChat();
      }
    } catch (error) {
      console.error("Failed to load or parse chat history:", error);
      handleNewChat();
    }
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('arkcom_chat_history', JSON.stringify(chatHistory));
    } else if (localStorage.getItem('arkcom_chat_history')) {
      // Clear storage if history is emptied
      localStorage.removeItem('arkcom_chat_history');
    }
    if (chatHistory.length >= 100) {
      setShowLimitModal(true);
    }
  }, [chatHistory]);

  const handleNewChat = useCallback(() => {
    if (chatHistory.length >= 100) {
        setShowLimitModal(true);
        return;
    }
    const newChat: ChatSession = { id: uuidv4(), messages: [], model: selectedModel };
    setChatHistory(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setActivePage('Home');
  }, [chatHistory.length, selectedModel]);

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setActivePage('Home');
  };
  
  const handleDeleteChat = (idToDelete: string) => {
    const remainingHistory = chatHistory.filter(chat => chat.id !== idToDelete);

    if (activeChatId === idToDelete) {
        if (remainingHistory.length > 0) {
            setActiveChatId(remainingHistory[0].id);
        } else {
            // No chats left, so create a new one
            const newChat: ChatSession = { id: uuidv4(), messages: [], model: selectedModel };
            setChatHistory([newChat]);
            setActiveChatId(newChat.id);
            return; 
        }
    }
    setChatHistory(remainingHistory);
  };

  const handleSaveMessage = (userMessage: ChatMessage, modelMessage: ChatMessage) => {
    setChatHistory(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, userMessage, modelMessage] }
          : chat
      )
    );
  };
    
  const handleUpdateModelMessageChunk = (chunk: string, sources?: any[]) => {
      setChatHistory(prev =>
          prev.map(chat => {
              if (chat.id === activeChatId) {
                  const newMessages = [...chat.messages];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'model') {
                      lastMessage.content = chunk;
                      if(sources) {
                        lastMessage.sources = sources;
                      }
                  } else {
                    newMessages.push({ role: 'model', content: chunk, sources });
                  }
                  return { ...chat, messages: newMessages };
              }
              return chat;
          })
      );
  };

  const handleSaveHistory = () => {
    const dataStr = JSON.stringify(chatHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = 'arkcom_chat_history.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    handleDeleteHistory();
  };

  const handleDeleteHistory = () => {
    setChatHistory([]);
    setActiveChatId(null);
    localStorage.removeItem('arkcom_chat_history');
    setShowLimitModal(false);
    handleNewChat();
  };

  const activeChat = chatHistory.find(chat => chat.id === activeChatId);
  
  const renderContent = () => {
    switch (activePage) {
      case 'Home':
        return activeChat && (
          <ChatView
              key={activeChat.id}
              messages={activeChat.messages}
              onSaveMessage={handleSaveMessage}
              onUpdateMessageChunk={handleUpdateModelMessageChunk}
              selectedModel={activeChat.model || 'gemini-2.5-flash'}
              onSetSelectedModel={(model) => {
                setSelectedModel(model);
                setChatHistory(prev => prev.map(c => c.id === activeChatId ? {...c, model} : c));
              }}
          />
        );
      case 'Discover':
        return <DiscoverPage />;
      case 'Spaces':
        return <SpacesPage />;
      case 'Finance':
        return <FinancePage />;
      default:
        return null;
    }
  }

  return (
    <div className={`flex h-screen w-full font-sans ${theme === 'dark' ? 'bg-[#1E2021] text-[#E3E3E3]' : 'bg-[#FFFFFF] text-gray-900'}`}>
      {showLimitModal && (
        <ChatLimitModal onSave={handleSaveHistory} onDelete={handleDeleteHistory} />
      )}
      <Sidebar
        history={chatHistory}
        activeId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        activePage={activePage}
        onSelectPage={setActivePage}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className={`flex-shrink-0 ${theme === 'dark' ? 'bg-[#2D2D2D] text-[#E3E3E3]' : 'bg-[#E2E5DE] text-gray-800'} text-center py-2 text-sm`}>
          ✨ Get AI power in your browser with Arkcom Assistant <a href="#" className={`font-bold underline ${theme === 'dark' ? 'hover:text-[#BDBDBD]' : 'hover:text-gray-600'} ml-2`}>Download Arkcom</a>
        </div>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;