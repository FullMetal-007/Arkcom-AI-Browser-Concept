import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
// Fix: Import `LightbulbIcon` to resolve reference error.
import { ArrowDownIcon, ArrowUpIcon, FinanceIcon, SearchIcon, LightbulbIcon } from '../components/icons/Icons';

const FinancePage: React.FC = () => {
    const { theme } = useTheme();
    const themeClasses = {
        bg: theme === 'dark' ? 'bg-[#1E2021]' : 'bg-white',
        cardBg: theme === 'dark' ? 'bg-[#2D2D2D]' : 'bg-[#F2F3F2]',
        textPrimary: theme === 'dark' ? 'text-[#E3E3E3]' : 'text-gray-800',
        textSecondary: theme === 'dark' ? 'text-[#BDBDBD]' : 'text-gray-600',
        border: theme === 'dark' ? 'border-[#727272]' : 'border-[#E2E5DE]',
        itemHoverBg: theme === 'dark' ? 'hover:bg-[#1E2021]' : 'hover:bg-[#E2E5DE]',
    };
    
    const marketData = [
        { ticker: "DOW", value: "39,127.14", change: "+15.57", percent: "+0.04%", positive: true },
        { ticker: "S&P 500", value: "5,467.09", change: "-8.55", percent: "-0.16%", positive: false },
        { ticker: "NASDAQ", value: "17,689.36", change: "-32.23", percent: "-0.18%", positive: false },
    ];
    
    const newsItems = [
        { source: "Bloomberg", title: "Federal Reserve signals potential rate cuts later this year.", time: "2h ago" },
        { source: "Reuters", title: "Tech stocks rally on positive earnings reports from major players.", time: "5h ago" },
        { source: "Wall Street Journal", title: "Global supply chain issues easing, but challenges remain.", time: "8h ago" },
    ];

    const askAI = (prompt: string) => {
        alert(`This would start a new chat with the financial prompt:\n\n"${prompt}"`);
    };

    return (
        <div className={`h-full overflow-y-auto p-8 ${themeClasses.bg}`}>
            <div className="max-w-6xl mx-auto">
                <h1 className={`text-4xl font-bold mb-8 ${themeClasses.textPrimary}`}>Finance</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 className={`text-2xl font-semibold mb-4 ${themeClasses.textPrimary}`}>Market Snapshot</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {marketData.map(item => (
                                <div key={item.ticker} className={`p-4 rounded-xl border ${themeClasses.cardBg} ${themeClasses.border}`}>
                                    <h3 className={`font-bold text-lg ${themeClasses.textPrimary}`}>{item.ticker}</h3>
                                    <p className={`text-2xl font-mono font-semibold my-2 ${themeClasses.textPrimary}`}>{item.value}</p>
                                    <div className={`flex items-center gap-2 text-sm ${item.positive ? 'text-green-500' : 'text-red-500'}`}>
                                        {item.positive ? <ArrowUpIcon className="h-4 w-4"/> : <ArrowDownIcon className="h-4 w-4"/>}
                                        <span>{item.change} ({item.percent})</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <h2 className={`text-2xl font-semibold mb-4 ${themeClasses.textPrimary}`}>Latest News</h2>
                        <div className={`rounded-xl border ${themeClasses.border} ${themeClasses.cardBg}`}>
                            <ul className={`divide-y ${themeClasses.border}`}>
                                {newsItems.map((item, index) => (
                                    <li key={index} className="p-4">
                                        <p className={`font-semibold ${themeClasses.textPrimary}`}>{item.title}</p>
                                        <div className={`text-xs mt-1 ${themeClasses.textSecondary}`}>
                                            <span>{item.source}</span> &bull; <span>{item.time}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h2 className={`text-2xl font-semibold mb-4 ${themeClasses.textPrimary}`}>Ask AI</h2>
                        <div className={`p-4 rounded-xl border flex flex-col gap-3 ${themeClasses.cardBg} ${themeClasses.border}`}>
                           <button onClick={() => askAI("Summarize today's market performance.")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${themeClasses.itemHoverBg} ${themeClasses.border} border`}>
                                <SearchIcon className="h-5 w-5"/>
                                <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>Summarize market performance</span>
                           </button>
                            <button onClick={() => askAI("What are the top-performing tech stocks this month?")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${themeClasses.itemHoverBg} ${themeClasses.border} border`}>
                                <FinanceIcon className="h-5 w-5"/>
                                <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>Analyze top tech stocks</span>
                           </button>
                           <button onClick={() => askAI("Explain the concept of dollar-cost averaging.")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${themeClasses.itemHoverBg} ${themeClasses.border} border`}>
                                <LightbulbIcon className="h-5 w-5"/>
                                <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>Explain a concept</span>
                           </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancePage;