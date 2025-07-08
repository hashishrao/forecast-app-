"use client";

import { useState, useTransition, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { chatAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export default function ChatAssistant() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello! I'm your BreatheEasy assistant. How can I help you with air quality today?",
        },
    ]);
    const [input, setInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || isPending) return;

        const newUserMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');

        startTransition(async () => {
            const result = await chatAction({ message: input });
            if (result.success && result.data) {
                const newAssistantMessage: Message = { role: 'assistant', content: result.data.response };
                setMessages(prev => [...prev, newAssistantMessage]);
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Failed to get a response from the assistant.",
                });
                // Add the user message back to the input if the API fails
                setInput(newUserMessage.content);
                setMessages(prev => prev.slice(0, -1));
            }
        });
    };
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]);

    return (
        <Card className="flex flex-col h-[500px]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot />
                    AI Assistant
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={cn(
                                'flex items-start gap-3',
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}>
                                {message.role === 'assistant' && (
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback><Bot size={20} /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    'p-3 rounded-lg max-w-xs md:max-w-md',
                                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                )}>
                                    <p className="text-sm">{message.content}</p>
                                </div>
                                {message.role === 'user' && (
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback><User size={20} /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {isPending && (
                             <div className="flex items-start gap-3 justify-start">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback><Bot size={20} /></AvatarFallback>
                                </Avatar>
                                <div className="p-3 rounded-lg bg-muted flex items-center">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSubmit} className="flex items-start gap-2 border-t pt-4">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about AQI, health, or pollutants..."
                        className="min-h-[40px] max-h-28 flex-1"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e as any);
                            }
                        }}
                        disabled={isPending}
                    />
                    <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
