
import React, { useState } from 'react';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { CheckCircle, Zap, Link, XCircle } from 'lucide-react';

interface IntegrationCardProps {
    name: string;
    description: string;
    logoUrl: string;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const IntegrationCard: React.FC<IntegrationCardProps> = ({ name, description, logoUrl }) => {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');

    const handleConnect = () => {
        setStatus('connecting');
        // Simulate API call
        setTimeout(() => {
            // Randomly succeed or fail for demo purposes
            if (Math.random() > 0.2) {
                setStatus('connected');
            } else {
                setStatus('error');
            }
        }, 1500);
    };

    const handleDisconnect = () => {
        setStatus('disconnected');
    };

    const getStatusIndicator = () => {
        switch (status) {
            case 'connected':
                return <span className="flex items-center text-xs text-green-400 gap-1"><CheckCircle className="h-3 w-3"/> Connected</span>;
            case 'error':
                 return <span className="flex items-center text-xs text-red-400 gap-1"><XCircle className="h-3 w-3"/> Connection Failed</span>;
            default:
                return <span className="text-xs text-text-secondary">Not Connected</span>;
        }
    };


    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <img src={logoUrl} alt={`${name} logo`} className="h-8 object-contain" />
                    {getStatusIndicator()}
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <h3 className="font-semibold text-text-primary">{name}</h3>
                <p className="text-sm text-text-secondary mt-1 flex-grow">{description}</p>
                <div className="mt-4">
                    {status === 'disconnected' && 
                        <Button onClick={handleConnect} className="w-full gap-2"><Link className="h-4 w-4"/> Connect</Button>
                    }
                    {status === 'connecting' &&
                        <Button disabled isLoading className="w-full">Connecting...</Button>
                    }
                    {status === 'error' && 
                        <Button onClick={handleConnect} variant="secondary" className="w-full gap-2">Retry Connection</Button>
                    }
                     {status === 'connected' && 
                        <div className="flex gap-2">
                             <Button disabled variant="secondary" className="w-full gap-2"><Zap className="h-4 w-4"/> Sync</Button>
                             <Button onClick={handleDisconnect} variant="ghost" className="text-text-secondary hover:text-white">Disconnect</Button>
                        </div>
                    }
                </div>
            </CardContent>
        </Card>
    );
};

export default IntegrationCard;
