import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { PlusCircleIcon, SpacesIcon } from '../components/icons/Icons';

const SpacesPage: React.FC = () => {
    const { theme } = useTheme();
    const themeClasses = {
        bg: theme === 'dark' ? 'bg-[#1E2021]' : 'bg-white',
        cardBg: theme === 'dark' ? 'bg-[#2D2D2D]' : 'bg-[#F2F3F2]',
        textPrimary: theme === 'dark' ? 'text-[#E3E3E3]' : 'text-gray-800',
        textSecondary: theme === 'dark' ? 'text-[#BDBDBD]' : 'text-gray-600',
        border: theme === 'dark' ? 'border-[#727272]' : 'border-[#E2E5DE]',
    };

    const spaces = [
        { name: "Project Phoenix", description: "Research and development for the new web platform.", members: 5 },
        { name: "Marketing Q3", description: "Campaigns and outreach for the third quarter.", members: 3 },
        { name: "Personal Notes", description: "A collection of my random thoughts and ideas.", members: 1 },
        { name: "API Integration", description: "Connecting third-party services to our app.", members: 2 },
    ];
    
    const createNewSpace = () => {
        alert("This would open a dialog to create a new space.");
    };

    return (
        <div className={`h-full overflow-y-auto p-8 ${themeClasses.bg}`}>
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className={`text-4xl font-bold ${themeClasses.textPrimary}`}>Spaces</h1>
                    <button onClick={createNewSpace} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${theme === 'dark' ? 'bg-[#E3E3E3] text-black hover:bg-[#BDBDBD]' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
                        <PlusCircleIcon className="h-5 w-5" />
                        New Space
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {spaces.map((space, index) => (
                        <div key={index} className={`p-6 rounded-xl border flex flex-col justify-between cursor-pointer transition-transform hover:scale-105 ${themeClasses.cardBg} ${themeClasses.border}`}>
                            <div>
                                <SpacesIcon className={`h-8 w-8 mb-4 ${themeClasses.textSecondary}`} />
                                <h3 className={`text-lg font-bold mb-2 ${themeClasses.textPrimary}`}>{space.name}</h3>
                                <p className={`text-sm mb-4 ${themeClasses.textSecondary}`}>{space.description}</p>
                            </div>
                            <div className={`text-xs ${themeClasses.textSecondary}`}>
                                {space.members} {space.members > 1 ? 'members' : 'member'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SpacesPage;
