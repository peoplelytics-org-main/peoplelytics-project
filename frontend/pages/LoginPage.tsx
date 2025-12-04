import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(username, password);
            navigate('/app/home');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center bg-primary-600 rounded-full">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl">Peoplelytics Login</CardTitle>
                    <CardDescription>Enter your credentials to sign in.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input label="Username or Email" id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="superadmin or admin@peoplelytics.com" required />
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full bg-background border border-border rounded-md px-3 py-2 pr-10 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary focus:outline-none"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        
                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-full">
                            Sign In
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-xs text-text-secondary bg-card border border-border p-3 rounded-md">
                        <h4 className="font-semibold text-text-primary mb-1">Demo Users</h4>
                        <p>Try logging in as:</p>
                        <p className="mt-1 font-mono">Super Admin:</p>
                        <p className="font-mono">Username: <span className="text-primary-400">superadmin</span></p>
                        <p className="font-mono">Password: <span className="text-primary-400">SuperAdmin@2024!</span></p>
                        <p className="mt-2 font-mono">Or use email: <span className="text-primary-400">admin@peoplelytics.com</span></p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;

// <h4 className="font-semibold text-text-primary mb-1">Demo Users</h4>
// <p>Try logging in as:</p>
// <p className="mt-1 font-mono">User: <span className="text-primary-400">superadmin@peoplelytics.com</span></p>
// <p className="font-mono">User: <span className="text-primary-400">amnakhan@innovateinc.com</span></p>
// <p className="font-mono">Password: <span className="text-primary-400">password123</span></p>