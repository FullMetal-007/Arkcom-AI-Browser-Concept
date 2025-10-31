import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { TrendingUpIcon, LightbulbIcon } from '../components/icons/Icons';

const DiscoverPage: React.FC = () => {
    const { theme } = useTheme();
    const themeClasses = {
        bg: theme === 'dark' ? 'bg-[#1E2021]' : 'bg-white',
        cardBg: theme === 'dark' ? 'bg-[#2D2D2D]' : 'bg-[#F2F3F2]',
        textPrimary: theme === 'dark' ? 'text-[#E3E3E3]' : 'text-gray-800',
        textSecondary: theme === 'dark' ? 'text-[#BDBDBD]' : 'text-gray-600',
        border: theme === 'dark' ? 'border-[#727272]' : 'border-[#E2E5DE]',
        itemHoverBg: theme === 'dark' ? 'hover:bg-[#1E2021]' : 'hover:bg-[#E2E5DE]',
    };

    const trendingTopics = [
        "The Future of AI in Healthcare",
        "Global Economic Outlook 2024",
        "Breakthroughs in Renewable Energy",
        "The Rise of Decentralized Finance",
        "Impact of Quantum Computing",
        "Latest Trends in Space Exploration",
    ];

    const promptStarters = [
        "Explain the concept of ... as if I were a 10-year-old.",
        "Write a short story in the style of ...",
        "Create a business plan for a startup that ...",
        "Compare and contrast the philosophies of ...",
        "Summarize the latest research on ...",
        "Draft a professional email to a client about ...",
    ];
    
    const startNewChatWithPrompt = (prompt: string) => {
        alert(`This would start a new chat with the prompt:\n\n"${prompt}"`);
    }

    return (
        <div className={`h-full overflow-y-auto p-8 ${themeClasses.bg}`}>
            <div className="max-w-6xl mx-auto">
                <h1 className={`text-4xl font-bold mb-8 ${themeClasses.textPrimary}`}>Discover</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                        <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-3 ${themeClasses.textPrimary}`}>
                            <TrendingUpIcon className="h-6 w-6" />
                            Trending Topics
                        </h2>
                        <div className={`rounded-xl border ${themeClasses.border} ${themeClasses.cardBg}`}>
                            <ul className={`divide-y ${themeClasses.border}`}>
                                {trendingTopics.map((topic, index) => (
                                    <li key={index}>
                                        <button onClick={() => startNewChatWithPrompt(`Tell me more about: ${topic}`)} className={`w-full text-left p-4 text-sm font-medium ${themeClasses.itemHoverBg} ${themeClasses.textSecondary}`}>
                                            {topic}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                    <section>
                        <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-3 ${themeClasses.textPrimary}`}>
                            <LightbulbIcon className="h-6 w-6" />
                            AI Prompt Starters
                        </h2>
                        <div className={`rounded-xl border ${themeClasses.border} ${themeClasses.cardBg}`}>
                           <ul className={`divide-y ${themeClasses.border}`}>
                                {promptStarters.map((prompt, index) => (
                                    <li key={index}>
                                        <button onClick={() => startNewChatWithPrompt(prompt)} className={`w-full text-left p-4 text-sm font-medium ${themeClasses.itemHoverBg} ${themeClasses.textSecondary}`}>
                                            {prompt}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DiscoverPage;
