import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Eye, EyeOff, Building2 } from 'lucide-react';

const LoginPage: React.FC = () => {
    // Ensure your AuthContext type definition for login accepts the 3rd argument
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // New State for Org ID
    const [organizationId, setOrganizationId] = useState(''); 
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Pass the organizationId (it can be empty string, backend handles that)
            await login(username, password, organizationId);
            navigate('/app/home');
        } catch (err: any) {
            // Handle specific backend message: "Invalid credentials. If you are a team member..."
            const msg = err.response?.data?.message || err.message || 'Invalid credentials.';
            setError(msg);
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
                        
                        {/* Organization ID Input */}
                        <div>
                            <Input 
                                label="Organization ID (Not required for Superadmin)" 
                                id="orgId" 
                                type="text" 
                                value={organizationId} 
                                onChange={e => setOrganizationId(e.target.value)} 
                                placeholder="e.g. org_innovate_inc" 
                            />
                            <p className="text-xs text-text-secondary mt-1">Required for organization members</p>
                        </div>

                        <Input 
                            label="Username" 
                            id="username" 
                            type="text" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            placeholder="Enter username" 
                            required 
                        />
                        
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
                        
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-full">
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 text-xs text-text-secondary bg-card border border-border p-4 rounded-md space-y-3">
                        <h4 className="font-semibold text-text-primary text-sm flex items-center gap-2">
                            <Building2 className="w-3 h-3" /> Demo Credentials
                        </h4>
                        
                        <div className="space-y-1">
                            <p className="font-bold text-primary-600">Super Admin (Master DB)</p>
                            <div className="grid grid-cols-[60px_1fr] gap-x-2">
                                <span>User:</span> <span className="font-mono text-text-primary">superadmin@123</span>
                                <span>Pass:</span> <span className="font-mono text-text-primary">SuperAdminP@ss123!</span>
                                <span>Org ID:</span> <span className="font-mono text-text-secondary italic">(Leave Empty)</span>
                            </div>
                        </div>

                        <div className="border-t border-border pt-2 space-y-1">
                            <p className="font-bold text-primary-600">Tenant User (Org DB)</p>
                            <div className="grid grid-cols-[60px_1fr] gap-x-2">
                                <span>User:</span> <span className="font-mono text-text-primary">amnakhan@innovateinc.com</span>
                                <span>Pass:</span> <span className="font-mono text-text-primary">password123</span>
                                <span>Org ID:</span> <span className="font-mono text-text-primary">org_innovate_inc</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;