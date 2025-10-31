import React, { useState } from 'react';
import type { SidebarProps, ChatSession, Page } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { 
    ArkcomLogo, PlusIcon, HomeIcon, DiscoverIcon, SpacesIcon, FinanceIcon, 
    BellIcon, UserIcon, UpgradeIcon, SunIcon, MoonIcon, SearchIcon, TrashIcon
} from './icons/Icons';

const Sidebar: React.FC<SidebarProps> = ({ history, activeId, onNewChat, onSelectChat, onDeleteChat, activePage, onSelectPage }) => {
    const { theme, toggleTheme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');

    const getChatTitle = (chat: ChatSession) => {
        const firstUserMessage = chat.messages.find(m => m.role === 'user');
        if (firstUserMessage?.content) {
            return firstUserMessage.content.length > 25
                ? `${firstUserMessage.content.substring(0, 25)}...`
                : firstUserMessage.content;
        }
        return 'New Chat';
    };

    const filteredHistory = history.filter(chat => {
        const title = getChatTitle(chat).toLowerCase();
        return title.includes(searchTerm.toLowerCase());
    });
    
    const themeClasses = {
        bg: theme === 'dark' ? 'bg-[#1E2021]' : 'bg-[#F2F3F2]',
        textPrimary: theme === 'dark' ? 'text-[#E3E3E3]' : 'text-gray-800',
        textSecondary: theme === 'dark' ? 'text-[#727272]' : 'text-gray-500',
        border: theme === 'dark' ? 'border-[#2D2D2D]' : 'border-[#E2E5DE]',
        itemHoverBg: theme === 'dark' ? 'hover:bg-[#2D2D2D]' : 'hover:bg-[#E2E5DE]',
        activeItemBg: theme === 'dark' ? 'bg-[#2D2D2D]' : 'bg-[#E2E5DE]',
        inputBg: theme === 'dark' ? 'bg-[#2D2D2D]' : 'bg-white',
    };

    const navItems = [
        { name: 'Home', icon: HomeIcon },
        { name: 'Discover', icon: DiscoverIcon },
        { name: 'Spaces', icon: SpacesIcon },
        { name: 'Finance', icon: FinanceIcon },
    ];
    
    const showPlaceholder = (feature: string) => alert(`${feature} functionality to be implemented.`);

    return (
        <aside className={`flex flex-col w-72 p-4 ${themeClasses.bg}`}>
            <div className="flex items-center gap-2 mb-4">
                <ArkcomLogo className={`h-8 w-8 ${theme === 'dark' ? 'text-[#E3E3E3]' : 'text-gray-600'}`} />
                <span className={`font-bold text-xl ${themeClasses.textPrimary}`}>Arkcom</span>
            </div>
            <button
                onClick={onNewChat}
                aria-label="New Chat"
                className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md truncate text-sm font-medium transition-colors mb-4 ${themeClasses.textPrimary} ${themeClasses.itemHoverBg} border ${themeClasses.border}`}
            >
                <PlusIcon className="h-5 w-5" />
                New Chat
            </button>
            <nav className="flex flex-col gap-1 w-full mb-4">
                {navItems.map(item => (
                    <button
                        key={item.name}
                        onClick={() => onSelectPage(item.name as Page)}
                        className={`flex items-center gap-3 w-full p-2 rounded-md transition-colors text-sm font-medium ${themeClasses.textPrimary} ${
                            activePage === item.name ? themeClasses.activeItemBg : themeClasses.itemHoverBg
                        }`}
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                    </button>
                ))}
            </nav>
            
            <div className="flex-1 flex flex-col overflow-y-hidden">
                <h2 className={`text-xs font-semibold mb-2 uppercase tracking-wider ${themeClasses.textSecondary}`}>History</h2>
                <div className="relative mb-2">
                    <SearchIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${themeClasses.textSecondary}`} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-md text-sm border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.textPrimary} placeholder:${themeClasses.textSecondary} focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                    />
                </div>
                <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                    <nav className="space-y-1">
                        {filteredHistory.map(chat => (
                            <div key={chat.id} className="relative group">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onSelectChat(chat.id);
                                    }}
                                    className={`block w-full text-left pl-3 pr-8 py-2 rounded-md truncate text-sm transition-colors ${themeClasses.textPrimary} ${
                                        activeId === chat.id && activePage === 'Home' ? (theme === 'dark' ? 'bg-[#2D2D2D]' : 'bg-[#E2E5DE]') : themeClasses.itemHoverBg
                                    }`}
                                >
                                    {getChatTitle(chat)}
                                </a>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChat(chat.id);
                                    }}
                                    aria-label="Delete chat"
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'text-gray-400 hover:text-red-500 hover:bg-red-500/10' : 'text-gray-500 hover:text-red-600 hover:bg-red-500/10'}`}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </nav>
                </div>
            </div>
            
            <div className={`pt-4 border-t ${themeClasses.border}`}>
                <button onClick={() => showPlaceholder('Notifications')} className={`flex items-center gap-3 w-full p-2 rounded-md ${themeClasses.textPrimary} ${themeClasses.itemHoverBg}`}>
                    <BellIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Notifications</span>
                </button>
                <button onClick={() => showPlaceholder('Account')} className={`flex items-center gap-3 w-full p-2 rounded-md ${themeClasses.textPrimary} ${themeClasses.itemHoverBg}`}>
                    <UserIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Account</span>
                </button>
                <button onClick={() => showPlaceholder('Upgrade')} className={`flex items-center gap-3 w-full p-2 rounded-md ${themeClasses.textPrimary} ${themeClasses.itemHoverBg}`}>
                    <UpgradeIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Upgrade</span>
                </button>
                <button onClick={toggleTheme} className={`flex items-center gap-3 w-full p-2 rounded-md ${themeClasses.textPrimary} ${themeClasses.itemHoverBg}`}>
                    {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                    <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;