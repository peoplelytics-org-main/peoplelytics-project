import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import logo from "../assets/abd2.png"
import { Check, Tag } from 'lucide-react';

const PricingPage: React.FC = () => {
    return (
        <div className="bg-background text-text-primary min-h-screen">
            {/* Header */}
            <header className="py-4 px-6 md:px-10 flex justify-between items-center border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
                <Link to="/" className="flex items-center gap-3 group">
                     <div className="p-1 bg-primary-600 rounded-lg group-hover:bg-primary-700 transition-colors">
                         {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                         </svg> */}
                         <img 
            src={logo} 
            alt="Peoplelytics Logo" 
            className="h-16 w-16 object-contain" // Adjusted size slightly to match typical navbar proportions better
        />
                     </div>
                     <h1 className="text-xl font-bold group-hover:text-primary-400 transition-colors">Peoplelytics</h1>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                </div>
            </header>

            <main className="py-20 px-6 md:px-10">
                <section className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Choose the Plan That's Right for You
                    </h2>
                    <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">
                        Simple, transparent pricing for teams of all sizes. Unlock the full potential of your people data today.
                    </p>
                </section>

                <section className="max-w-7xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                    {/* Basic Plan */}
                    <div className="bg-card border border-border rounded-lg p-8 flex flex-col h-full">
                        <h3 className="text-2xl font-bold">Basic</h3>
                        <p className="mt-2 text-text-secondary">For teams up to 150 employees.</p>
                        <div className="mt-6 flex items-baseline gap-x-2">
                             <span className="text-4xl font-extrabold">$1.5</span>
                             <span className="text-base font-medium text-text-secondary">/ employee / month</span>
                        </div>
                        <div className="mt-4 text-xs text-text-secondary space-y-1">
                            <p className="flex items-center gap-2"><Tag className="h-3 w-3 text-primary-400" /> Save 10% with Bi-Annual billing</p>
                            <p className="flex items-center gap-2"><Tag className="h-3 w-3 text-primary-400" /> Save 25% with Annual billing</p>
                        </div>
                        <Link to="/login" className="w-full mt-6">
                           <Button variant="secondary" className="w-full">Choose Plan</Button>
                        </Link>
                        <ul className="mt-8 space-y-4 text-text-secondary flex-1">
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Core Dashboard Widgets</span></li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Standard Reports</span></li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Data Import & Export</span></li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>1 Org Admin user</span></li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Community Support</span></li>
                        </ul>
                    </div>
                    
                    {/* Intermediate Plan */}
                    <div className="bg-card border border-border rounded-lg p-8 flex flex-col h-full">
                        <h3 className="text-2xl font-bold">Intermediate</h3>
                        <p className="mt-2 text-text-secondary">For teams up to 300 employees.</p>
                        <div className="mt-6 flex items-baseline gap-x-2">
                             <span className="text-4xl font-extrabold">$1.3</span>
                             <span className="text-base font-medium text-text-secondary">/ employee / month</span>
                        </div>
                         <div className="mt-4 text-xs text-text-secondary space-y-1">
                            <p className="flex items-center gap-2"><Tag className="h-3 w-3 text-primary-400" /> Save 10% with Bi-Annual billing</p>
                            <p className="flex items-center gap-2"><Tag className="h-3 w-3 text-primary-400" /> Save 25% with Annual billing</p>
                        </div>
                        <Link to="/login" className="w-full mt-6">
                           <Button variant="secondary" className="w-full">Choose Plan</Button>
                        </Link>
                        <ul className="mt-8 space-y-4 text-text-secondary flex-1">
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-text-primary">Everything in Basic, plus:</span></li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>AI-Powered Insights & Story</span></li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Advanced Reporting & Org Chart</span></li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>1 Org Admin & 1 HR Analyst</span></li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Email Support</span></li>
                        </ul>
                    </div>

                    {/* Pro Plan - Highlighted */}
                    <div className="bg-card border-2 border-primary-500 rounded-lg p-8 flex flex-col h-full relative shadow-2xl shadow-primary-900/40">
                        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                            <span className="bg-primary-600 text-white text-xs font-semibold px-4 py-1 rounded-full uppercase">Most Popular</span>
                        </div>
                        <h3 className="text-2xl font-bold">Pro</h3>
                        <p className="mt-2 text-text-secondary">For teams up to 750 employees.</p>
                        <div className="mt-6 flex items-baseline gap-x-2">
                             <span className="text-4xl font-extrabold">$1.1</span>
                             <span className="text-base font-medium text-text-secondary">/ employee / month</span>
                        </div>
                         <div className="mt-4 text-xs text-text-secondary space-y-1">
                            <p className="flex items-center gap-2"><Tag className="h-3 w-3 text-primary-400" /> Save 10% with Bi-Annual billing</p>
                            <p className="flex items-center gap-2"><Tag className="h-3 w-3 text-primary-400" /> Save 25% with Annual billing</p>
                        </div>
                         <Link to="/login" className="w-full mt-6">
                           <Button className="w-full">Choose Plan</Button>
                        </Link>
                        <ul className="mt-8 space-y-4 text-text-secondary flex-1">
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-text-primary">Everything in Intermediate, plus:</span></li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Predictive Analytics Models</span></li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>AI Assistant with Function Calling</span></li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>View-only User Management</span></li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>1 Org Admin, 3 HR Analysts, 10 Executives</span></li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Priority Email Support</span></li>
                        </ul>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-card border border-border rounded-lg p-8 flex flex-col h-full">
                        <h3 className="text-2xl font-bold">Enterprise</h3>
                        <p className="mt-2 text-text-secondary">For teams with 750+ employees.</p>
                        <div className="mt-6 flex items-baseline gap-x-2">
                             <span className="text-4xl font-extrabold">$0.9</span>
                             <span className="text-base font-medium text-text-secondary">/ employee / month</span>
                        </div>
                         <div className="mt-4 text-xs text-text-secondary space-y-1">
                            <p className="flex items-center gap-2"><Tag className="h-3 w-3 text-primary-400" /> Save 10% with Bi-Annual billing</p>
                            <p className="flex items-center gap-2"><Tag className="h-3 w-3 text-primary-400" /> Save 25% with Annual billing</p>
                        </div>
                         <Link to="/login" className="w-full mt-6">
                           <Button variant="secondary" className="w-full">Contact Sales</Button>
                        </Link>
                        <ul className="mt-8 space-y-4 text-text-secondary flex-1">
                           <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-text-primary">Everything in Pro, plus:</span></li>
                           <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>1 Org Admin</span></li>
                           <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Unlimited HR Analysts & Executives</span></li>
                           <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>HRIS Integrations</span></li>
                           <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Dedicated Account Manager</span></li>
                           <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Single Sign-On (SSO)</span></li>
                           <li className="flex items-start gap-3"><Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Custom SLAs</span></li>
                        </ul>
                    </div>
                </section>
            </main>

            <footer className="py-8 px-6 md:px-10 border-t border-border mt-16">
                <div className="max-w-6xl mx-auto text-center text-text-secondary text-sm">
                    <p>&copy; {new Date().getFullYear()} Peoplelytics. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default PricingPage;