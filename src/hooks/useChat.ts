import { useState, useCallback } from 'react';
import { IMessage } from 'react-native-gifted-chat';
import { useAI } from '../services/ai';
import {
    saveChatThread,
    getChatThreadById,
    getCurrentThreadId,
    saveCurrentThreadId,
    ChatThread
} from '../services/storage';

export const useChat = () => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
    const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
    const { generateResponse, isLoading, error, isInitialized, currentModel } = useAI();

    const createNewThread = useCallback(async () => {
        const newThreadId = Date.now().toString();
        const newThread: ChatThread = {
            id: newThreadId,
            title: 'New Conversation',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: []
        };

        await saveChatThread(newThread);
        await saveCurrentThreadId(newThreadId);
        setCurrentThreadId(newThreadId);
        setCurrentThread(newThread);

        const welcomeMessage: IMessage = {
            _id: 'welcome',
            text: `Welcome to a new conversation! You can ask me anything.`,
            createdAt: new Date(),
            user: {
                _id: 2,
                name: 'AI Assistant',
                avatar: 'https://images.unsplash.com/photo-1531379410502-63bfe8cdaf6f?w=64&h=64&fit=crop&crop=faces',
            },
        };

        setMessages([welcomeMessage]);
        const updatedThread = {
            ...newThread, messages: [{
                id: welcomeMessage._id.toString(),
                content: welcomeMessage.text,
                timestamp: welcomeMessage.createdAt instanceof Date ? welcomeMessage.createdAt.getTime() : welcomeMessage.createdAt,
                isUser: false
            }]
        };

        await saveChatThread(updatedThread);
        setCurrentThread(updatedThread);
        return updatedThread;
    }, []);

    const saveMessageToThread = useCallback(async (message: IMessage, isUser: boolean) => {
        const mostRecentThreadId = await getCurrentThreadId();
        let threadToUse = mostRecentThreadId ? await getChatThreadById(mostRecentThreadId) : null;

        if (!threadToUse) {
            threadToUse = await createNewThread();
        }

        if (threadToUse.id !== currentThreadId) {
            setCurrentThreadId(threadToUse.id);
            setCurrentThread(threadToUse);
        }

        const updatedThread = {
            ...threadToUse,
            messages: [...(threadToUse.messages || [])],
            title: isUser && threadToUse.title === 'New Conversation' && message.text.length > 0
                ? message.text.substring(0, 30) + (message.text.length > 30 ? '...' : '')
                : threadToUse.title,
            updatedAt: Date.now()
        };

        updatedThread.messages.push({
            id: message._id.toString(),
            content: message.text,
            timestamp: message.createdAt instanceof Date ? message.createdAt.getTime() : message.createdAt,
            isUser
        });

        await saveChatThread(updatedThread);
        setCurrentThread(updatedThread);
    }, [currentThreadId, createNewThread]);

    const addMessage = useCallback((text: string, isUser: boolean = true) => {
        const message: IMessage = {
            _id: Date.now().toString() + text,
            text,
            createdAt: new Date(),
            user: {
                _id: isUser ? 1 : 2,
                name: isUser ? 'You' : 'AI Assistant',
                avatar: isUser ? undefined : 'https://images.unsplash.com/photo-1531379410502-63bfe8cdaf6f?w=64&h=64&fit=crop&crop=faces',
            },
        };

        setMessages(previousMessages => GiftedChat.append(previousMessages, [message]));
        saveMessageToThread(message, isUser);
    }, [saveMessageToThread]);

    const handleFinalTranscript = useCallback(async (transcript: string) => {
        if (!transcript.trim()) return;

        addMessage(transcript);

        try {
            const response = await generateResponse(transcript);
            if (response) {
                const responseText = typeof response === 'string'
                    ? response
                    : response?.choices?.[0]?.message?.content || 'No response content';
                addMessage(responseText, false);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            addMessage(`Sorry, I encountered an error: ${errorMessage}`, false);
        }
    }, [addMessage, generateResponse]);

    return {
        messages,
        currentThread,
        isLoading,
        error,
        isInitialized,
        currentModel,
        createNewThread,
        addMessage,
        handleFinalTranscript,
    };
}; 