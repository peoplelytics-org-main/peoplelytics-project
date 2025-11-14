import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import { functionDeclarations, executeFunctionCall } from '../services/aiDataTools';
import { useData } from '../contexts/DataContext';
import { MOCK_JOB_POSITIONS, MOCK_RECRUITMENT_FUNNEL_DATA } from '../constants/data';
import { User, Sparkles, BrainCircuit, HelpCircle, X } from 'lucide-react';
import { AI_ASSISTANT_INSTRUCTIONS } from '../constants/mockExitInterviewData';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AIAssistantPage: React.FC = () => {
  const { employeeData, attendanceData } = useData();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
      {
          sender: 'ai',
          text: "Tariq here. I am ready to analyse your organisational data and provide strategic insights. You can start by uploading data or asking your first question. I recommend enabling the 'Anonymize Data' option for enhanced privacy."
      }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (process.env.API_KEY) {
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: AI_ASSISTANT_INSTRUCTIONS,
                tools: [{ functionDeclarations }]
            }
        });
    }
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessageText = input;
    const userMessage: Message = { sender: 'user', text: userMessageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        let result = await chatRef.current.sendMessage({ message: userMessageText });

        while (true) {
            const functionCalls = result.candidates?.[0]?.content?.parts
                ?.map(p => p.functionCall)
                .filter((fc): fc is { name: string; args: any } => !!fc?.name);

            // If the AI wants to call a function but no data is loaded, stop and inform the user.
            if (functionCalls && functionCalls.length > 0 && employeeData.length === 0) {
                const noDataMessage: Message = {
                    sender: 'ai',
                    text: "I cannot answer questions about your data because no dataset has been loaded. Please navigate to the **Data Management** page to upload or load a sample dataset first."
                };
                setMessages(prev => [...prev, noDataMessage]);
                break; // Exit the while loop
            }
            
            if (!functionCalls || functionCalls.length === 0) {
                const aiResponseText = result.text;
                const aiMessage: Message = { sender: 'ai', text: aiResponseText };
                setMessages(prev => [...prev, aiMessage]);
                break; 
            }
            
            const dataContext = {
                employees: employeeData,
                attendance: attendanceData,
                jobPositions: MOCK_JOB_POSITIONS,
                recruitmentFunnels: MOCK_RECRUITMENT_FUNNEL_DATA,
            };

            const functionResponses = await Promise.all(
                functionCalls.map(call => executeFunctionCall(dataContext, call))
            );
            
            result = await chatRef.current.sendMessage({ message: functionResponses });
        }
    } catch (error) {
        console.error("Error during AI chat:", error);
        const errorMessage: Message = { sender: 'ai', text: "Sorry, I encountered an error. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">AI Assistant</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsHelpModalOpen(true)} className="p-2 h-10 w-10" aria-label="Open help modal">
                <HelpCircle className="h-6 w-6 text-text-secondary"/>
            </Button>
        </div>

        <Card className="flex-1 flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'ai' && (
                        <div className={`p-2 rounded-full ${msg.text.includes("error") || msg.text.includes("cannot answer") ? "bg-red-600" : "bg-primary-600"}`}>
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                    )}
                    <div className={`rounded-lg p-3 max-w-lg prose prose-invert prose-sm ${msg.sender === 'user' ? 'bg-primary-700 text-white' : 'bg-card'}`}>
                       <MarkdownRenderer text={msg.text} />
                    </div>
                    {msg.sender === 'user' && <div className="p-2 bg-text-secondary rounded-full"><User className="h-5 w-5 text-background" /></div>}
                </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-600 rounded-full animate-pulse"><BrainCircuit className="h-5 w-5 text-white" /></div>
                    <div className="rounded-lg p-3 max-w-lg bg-card">
                       <div className="flex items-center gap-2 text-sm text-text-secondary italic">
                           <div className="h-2 w-2 bg-primary-400 rounded-full animate-ping"></div>
                           Thinking...
                       </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={!process.env.API_KEY ? "API Key not configured. AI is disabled." : "Ask a question about your data..."}
                        className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        disabled={isLoading || !process.env.API_KEY}
                    />
                    <Button onClick={handleSendMessage} isLoading={isLoading} disabled={!process.env.API_KEY}>Send</Button>
                </div>
            </div>
        </Card>

        {isHelpModalOpen && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                    <CardHeader>
                        <CardTitle>AI Assistant Capabilities</CardTitle>
                        <CardDescription>Here are some examples of questions you can ask Tariq HR.</CardDescription>
                        <button onClick={() => setIsHelpModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-border transition-colors" aria-label="Close help modal">
                            <X className="h-5 w-5 text-text-secondary"/>
                        </button>
                    </CardHeader>
                    <CardContent className="overflow-y-auto space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Key Capabilities</h3>
                            
                            <h4 className="font-semibold text-text-primary mt-3 mb-1">Headcount and Demographics</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
                                <li>"How many active employees are in the Engineering department?"</li>
                                <li>"What is our total headcount?"</li>
                            </ul>

                            <h4 className="font-semibold text-text-primary mt-3 mb-1">Turnover and Retention Analysis</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
                                <li>"What's the annual turnover rate for the Sales department?"</li>
                                <li>"Tell me our retention rate for high-performers over the last year."</li>
                                <li>"What is the first-year retention rate?"</li>
                            </ul>

                            <h4 className="font-semibold text-text-primary mt-3 mb-1">Engagement and Performance Insights</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
                                <li>"Which 3 departments have the lowest engagement scores?"</li>
                                <li>"What is the average engagement score for the company?"</li>
                                <li>"What's the average performance rating for people hired in the last 6 months?"</li>
                            </ul>

                            <h4 className="font-semibold text-text-primary mt-3 mb-1">Talent Risk Assessment</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
                                <li>"How many of our high-performers are also a high flight risk?"</li>
                            </ul>

                            <h4 className="font-semibold text-text-primary mt-3 mb-1">Recruitment Pipeline Analysis</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
                                <li>"How many open positions do we currently have?"</li>
                                <li>"Give me a summary of the recruitment funnel."</li>
                            </ul>
                            
                            <h4 className="font-semibold text-text-primary mt-3 mb-1">Attendance and Absenteeism</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
                                <li>"What is the overall absence rate?"</li>
                                <li>"Calculate the unscheduled absence rate for the IT Operations department."</li>
                            </ul>
                        </div>
                        
                        <div className="border-t border-border pt-4">
                            <h3 className="text-lg font-semibold text-text-primary mb-2">How It Works</h3>
                            <p className="text-sm text-text-secondary">
                                The AI Assistant is more than just a simple chatbot. It uses a powerful model (Gemini) that has been given a specific persona—an expert HR analyst—and a set of tools.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  );
};

export default AIAssistantPage;
