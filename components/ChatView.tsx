import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { geminiService } from '../services/geminiService';
import { useTheme } from '../contexts/ThemeContext';
import type { ChatMessage, ChatViewProps, GroundingSource, AttachedImage } from '../types';
import {
    ArkcomLogo, UserIcon, WandIcon, PaperclipIcon, MicIcon, GlobeIcon, SettingsIcon, SendIcon,
    SearchIcon, FocusIcon, StopCircleIcon, CloseIcon, AcademicIcon, SocialIcon, FinanceIcon,
    LinearIcon, NotionIcon, GithubIcon, ExternalLinkIcon
} from './icons/Icons';

// Fix: Add types for the Web Speech API to resolve TypeScript errors.
interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}
  
interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}
  
interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}
  
interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    start(): void;
    stop(): void;
}

// SpeechRecognition setup
// Fix: Cast window to `any` to access browser-specific APIs and rename variable to avoid type conflict.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: SpeechRecognition | null = null;
if (SpeechRecognitionAPI) {
  recognition = new SpeechRecognitionAPI();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
}


const ChatView: React.FC<ChatViewProps> = ({ messages, onSaveMessage, onUpdateMessageChunk, selectedModel, onSetSelectedModel }) => {
    const { theme } = useTheme();
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [attachedFile, setAttachedFile] = useState<AttachedImage | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [showSourcesPopover, setShowSourcesPopover] = useState(false);
    const [showSettingsPopover, setShowSettingsPopover] = useState(false);
    const [useWebSearch, setUseWebSearch] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sourcesPopoverRef = useRef<HTMLDivElement>(null);
    const settingsPopoverRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        const initChat = async () => {
            const session = await geminiService.startChat(messages, selectedModel, useWebSearch);
            setChatSession(session);
        };
        initChat();
        // By using an empty dependency array, this effect will run only once when the
        // ChatView component mounts. Thanks to the `key={activeChat.id}` prop in App.tsx,
        // switching to a new or different chat will cause the component to remount,
        // correctly initializing a new, separate chat session. This prevents the previous
        // issue where the session was being recreated on every message, which could lead
        // to loss of conversation context and unexpected behavior.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Close popovers on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sourcesPopoverRef.current && !sourcesPopoverRef.current.contains(event.target as Node)) {
                setShowSourcesPopover(false);
            }
            if (settingsPopoverRef.current && !settingsPopoverRef.current.contains(event.target as Node)) {
                setShowSettingsPopover(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Voice recognition effect
    useEffect(() => {
        if (!recognition) return;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setInput(prev => prev + finalTranscript);
        };
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => console.error('Speech recognition error:', event.error);
        
        return () => {
            recognition?.stop();
        };
    }, []);

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };
    useEffect(adjustTextareaHeight, [input]);

    const handleSendMessage = useCallback(async () => {
        if ((!input.trim() && !attachedFile) || !chatSession || isGenerating) return;
        
        const userMessage: ChatMessage = { role: 'user', content: input.trim(), image: attachedFile || undefined };
        const currentInput = input.trim();
        const currentFile = attachedFile;

        setInput('');
        setAttachedFile(null);
        setIsGenerating(true);

        const temporaryModelMessage: ChatMessage = { role: 'model', content: '' };
        onSaveMessage(userMessage, temporaryModelMessage);

        try {
            let finalModelContent = '';
            let finalSources: GroundingSource[] | undefined;

            const onChunk = (chunk: string) => {
                finalModelContent = chunk;
                onUpdateMessageChunk(chunk, finalSources);
            };
            const onSources = (sources: GroundingSource[]) => finalSources = sources;

            await geminiService.sendMessage(chatSession, currentInput, currentFile, onChunk, onSources);
        } catch (error) {
            // Log the detailed error for debugging purposes.
            console.error("Error sending message:", error); 
            // Display a more user-friendly and informative error message.
            const userFriendlyError = "I'm sorry, an error occurred while processing your request. Please try again shortly.";
            onUpdateMessageChunk(userFriendlyError);
        } finally {
            // Ensure the generating state is always reset.
            setIsGenerating(false);
        }
    }, [input, attachedFile, chatSession, isGenerating, onSaveMessage, onUpdateMessageChunk]);

    const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setAttachedFile({ mimeType: file.type, data: base64String });
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select an image file.');
        }
        e.target.value = ''; // Reset file input
    };
    
    const handleVoiceInput = () => {
        if (!recognition) return alert('Speech recognition is not supported in this browser.');
        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

    const handleEnhanceText = async () => {
        if (!input.trim() || isEnhancing) return;
        setIsEnhancing(true);
        const enhancedText = await geminiService.enhanceText(input);
        setInput(enhancedText);
        setIsEnhancing(false);
    };

    const showPlaceholder = (feature: string) => alert(`${feature} functionality to be implemented.`);
    
    const themeClasses = {
        bg: theme === 'dark' ? 'bg-[#1E2021]' : 'bg-[#FFFFFF]',
        textPrimary: theme === 'dark' ? 'text-[#E3E3E3]' : 'text-gray-800',
        textSecondary: theme === 'dark' ? 'text-[#BDBDBD]' : 'text-gray-600',
        textTertiary: theme === 'dark' ? 'text-[#727272]' : 'text-gray-400',
        inputBg: theme === 'dark' ? 'bg-[#2D2D2D]' : 'bg-[#F2F3F2]',
        inputBorder: theme === 'dark' ? 'border-[#727272]' : 'border-[#E2E5DE]',
        buttonMutedBg: theme === 'dark' ? 'bg-[#1E2021] hover:bg-[#2D2D2D]' : 'bg-[#F2F3F2] hover:bg-[#E2E5DE]',
        buttonMutedText: theme === 'dark' ? 'text-[#E3E3E3]' : 'text-black',
        iconMuted: theme === 'dark' ? 'text-[#BDBDBD] hover:text-[#E3E3E3]' : 'text-gray-500 hover:text-black',
        sourceBg: theme === 'dark' ? 'bg-[#2D2D2D] hover:bg-[#1E2021] border-[#727272]' : 'bg-[#F2F3F2] hover:bg-[#E2E5DE] border-[#E2E5DE]',
        sourceText: theme === 'dark' ? 'text-[#BDBDBD]' : 'text-gray-700',
        popoverBg: theme === 'dark' ? 'bg-[#2D2D2D]' : 'bg-white',
        popoverBorder: theme === 'dark' ? 'border-[#727272]' : 'border-[#E2E5DE]',
        // Fix: Add missing theme class property.
        itemHoverBg: theme === 'dark' ? 'hover:bg-[#2D2D2D]' : 'hover:bg-[#E2E5DE]',
    };

    return (
        <div className={`flex flex-col h-full overflow-hidden ${themeClasses.bg}`}>
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center h-full">
                            <ArkcomLogo className="h-24 w-24 mb-6" />
                            <h1 className={`text-5xl font-bold mb-4 ${themeClasses.textSecondary}`}>Arkcom</h1>
                            <p className={themeClasses.textSecondary}>Ask anything to start a new conversation.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'model' && <ArkcomLogo className="h-8 w-8 flex-shrink-0 mt-1" />}
                                    <div className="max-w-2xl">
                                        {msg.image && (
                                            <div className="mb-2">
                                                <img src={`data:${msg.image.mimeType};base64,${msg.image.data}`} alt="User attachment" className="rounded-lg max-w-xs max-h-64" />
                                            </div>
                                        )}
                                        <p className={`whitespace-pre-wrap leading-relaxed text-justify ${themeClasses.textPrimary}`}>
                                            {msg.role === 'model' ? msg.content.replace(/\*/g, '') : msg.content}
                                            {isGenerating && index === messages.length - 1 && <span className={`inline-block w-2 h-4 animate-pulse ml-1 ${theme === 'dark' ? 'bg-[#E3E3E3]' : 'bg-[#E2E5DE]'}`}></span>}
                                        </p>
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className={`font-semibold text-sm ${themeClasses.textTertiary} mb-2`}>Sources:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {msg.sources.map((source, i) => (
                                                        <a href={source.uri} key={i} target="_blank" rel="noopener noreferrer" className={`text-xs px-2 py-1 rounded-md transition-colors truncate border ${themeClasses.sourceBg} ${themeClasses.sourceText}`}>
                                                            {source.title || new URL(source.uri).hostname}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {msg.role === 'user' && <UserIcon className={`h-8 w-8 ${themeClasses.textSecondary} flex-shrink-0 mt-1`} />}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-shrink-0 w-full px-4 md:px-8 pb-8">
                <div className="max-w-4xl mx-auto relative">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className={`${themeClasses.inputBg} border ${themeClasses.inputBorder} rounded-2xl p-3 flex flex-col gap-3 shadow-2xl`}>
                         {attachedFile && (
                            <div className="relative w-fit">
                                <img src={`data:${attachedFile.mimeType};base64,${attachedFile.data}`} alt="Attachment preview" className="rounded-lg h-20 w-auto" />
                                <button onClick={() => setAttachedFile(null)} className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5 hover:bg-gray-950 transition-colors">
                                    <CloseIcon className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                placeholder="Ask anything..."
                                className={`w-full bg-transparent focus:outline-none resize-none text-base ${theme === 'dark' ? 'placeholder-[#727272] text-[#E3E3E3]' : 'placeholder-gray-400 text-black'}`}
                                rows={1}
                            />
                            <input type="file" ref={fileInputRef} onChange={handleFileAttach} accept="image/*" className="hidden" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-full transition-colors ${themeClasses.iconMuted}`}><PaperclipIcon /></button>
                            <button type="button" onClick={handleVoiceInput} className={`p-2 rounded-full transition-colors ${isListening ? 'text-red-500' : themeClasses.iconMuted}`}>
                                {isListening ? <StopCircleIcon /> : <MicIcon />}
                            </button>
                             <button type="submit" disabled={isGenerating || (!input.trim() && !attachedFile)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-[#BDBDBD] hover:text-[#E3E3E3] disabled:text-[#727272]' : 'text-gray-500 hover:text-black disabled:text-gray-300'}`}>
                                <SendIcon />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <button type="button" onClick={() => showPlaceholder('Search mode')} className={`flex items-center gap-1.5 text-sm pl-2 pr-3 py-1 rounded-lg transition-colors ${themeClasses.buttonMutedBg} ${themeClasses.buttonMutedText}`}>
                                    <SearchIcon className="h-4 w-4"/>
                                    <span className="font-medium">Search</span>
                                </button>
                                <button type="button" onClick={handleEnhanceText} disabled={isEnhancing} className={`p-2 rounded-full transition-colors ${themeClasses.iconMuted}`}>
                                    {isEnhancing ? <div className="h-5 w-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div> : <WandIcon />}
                                </button>
                                <button type="button" onClick={() => showPlaceholder('Focus mode')} className={`p-2 rounded-full transition-colors ${themeClasses.iconMuted}`}><FocusIcon /></button>
                            </div>
                            <div className="flex items-center gap-1">
                                <button type="button" onClick={() => setShowSourcesPopover(p => !p)} className={`p-2 rounded-full transition-colors ${themeClasses.iconMuted}`}><GlobeIcon /></button>
                                <button type="button" onClick={() => setShowSettingsPopover(p => !p)} className={`p-2 rounded-full transition-colors ${themeClasses.iconMuted}`}><SettingsIcon /></button>
                            </div>
                        </div>
                    </form>

                    {/* Popovers */}
                    {showSourcesPopover && (
                        <div ref={sourcesPopoverRef} className={`absolute bottom-full right-8 mb-2 w-72 rounded-lg shadow-lg border p-2 z-10 ${themeClasses.popoverBg} ${themeClasses.popoverBorder}`}>
                             <div className="flex items-center justify-between p-2 rounded-md hover:bg-opacity-50 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 font-semibold"><GlobeIcon className="w-5 h-5"/>Web</div>
                                    <div className={`text-xs ${themeClasses.textTertiary}`}>Search across the entire internet</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={useWebSearch} onChange={() => setUseWebSearch(v => !v)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            {/* Other source toggles */}
                            <div className="p-2 opacity-50 cursor-not-allowed" onClick={() => showPlaceholder('Academic Search')}>... more sources coming soon ...</div>
                        </div>
                    )}
                     {showSettingsPopover && (
                        <div ref={settingsPopoverRef} className={`absolute bottom-full right-0 mb-2 w-56 rounded-lg shadow-lg border p-2 z-10 ${themeClasses.popoverBg} ${themeClasses.popoverBorder}`}>
                            <div className="text-sm font-semibold p-2">Model</div>
                            <button onClick={() => { onSetSelectedModel('gemini-2.5-flash'); setShowSettingsPopover(false); }} className={`w-full text-left p-2 rounded-md ${selectedModel === 'gemini-2.5-flash' ? (theme === 'dark' ? 'bg-[#1E2021]' : 'bg-[#E2E5DE]') : ''} ${themeClasses.itemHoverBg}`}>gemini-2.5-flash</button>
                            <button onClick={() => { onSetSelectedModel('gemini-2.5-pro'); setShowSettingsPopover(false); }} className={`w-full text-left p-2 rounded-md ${selectedModel === 'gemini-2.5-pro' ? (theme === 'dark' ? 'bg-[#1E2021]' : 'bg-[#E2E5DE]') : ''} ${themeClasses.itemHoverBg}`}>gemini-2.5-pro</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatView;