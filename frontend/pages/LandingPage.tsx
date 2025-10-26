import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { NAV_ITEMS } from '../constants';
import { ArrowRight, CheckCircle, LayoutDashboard, Lightbulb, TrendingUp, FilePieChart, BrainCircuit } from 'lucide-react';

const DETAILED_FEATURES = [
    {
        name: 'Interactive Dashboards',
        description: 'Get a real-time, bird\'s-eye view of your entire workforce. Our dashboards consolidate all your key HR metrics into one intuitive interface, allowing you to spot trends, identify issues, and track progress towards your goals instantly.',
        subFeatures: ['Customizable KPI Scorecards', 'Drag-and-Drop Widget Layout', 'Interactive Charts with Drill-Down', 'AI-Powered Narrative Summaries'],
        imageUrl: '/images/feature-dashboard.png',
        icon: LayoutDashboard,
    },
    {
        name: 'Predictive Analytics',
        description: 'Move from reactive to proactive HR strategy. Our AI models analyze your historical data to forecast future trends, from identifying employees at high risk of turnover to predicting future performance and departmental burnout hotspots.',
        subFeatures: ['Turnover Risk Prediction', 'Performance Trajectory Forecasts', 'KPI Forecasting with Confidence Intervals', 'Burnout Risk Hotspot Identification'],
        imageUrl: '/images/feature-prediction.png',
        icon: Lightbulb,
    },
    {
        name: 'Advanced Reporting',
        description: 'Go beyond basic charts with our comprehensive reporting suite. Explore your organizational structure with an interactive org chart, segment your talent with a 9-box grid, and analyze the nuances of talent risk with our risk matrix.',
        subFeatures: ['Interactive Org Chart Explorer', 'Talent Risk & Performance Matrices', 'Detailed Exit Interview Insights', 'Schedulable Reports for Stakeholders'],
        imageUrl: '/images/feature-reporting.png',
        icon: FilePieChart,
    },
    {
        name: 'Skill Set & Gap Analysis',
        description: "Understand your organization's true capabilities. Map every skill across your workforce, identify critical skills held by too few people, and run gap analyses to see if you have the talent needed for future challenges.",
        subFeatures: ['Comprehensive Skill Matrix View', 'At-Risk & Niche Skill Identification', 'Skill Impact on Performance Analysis', 'Future-State Skill Gap Planning'],
        imageUrl: '/images/feature-skills.png',
        icon: BrainCircuit,
    },
];

const LandingPage: React.FC = () => {
    return (
        <div className="bg-background text-text-primary min-h-screen">
            {/* Header */}
            <header className="py-4 px-6 md:px-10 flex justify-between items-center border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
                <Link to="/" className="flex items-center gap-3">
                     <div className="p-2 bg-primary-600 rounded-lg">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                         </svg>
                     </div>
                     <h1 className="text-xl font-bold">Peoplelytics</h1>
                </Link>
                <div className="flex items-center gap-2">
                    <Link to="/pricing">
                        <Button variant="ghost">Pricing</Button>
                    </Link>
                    <Link to="/login">
                        <Button>Login</Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="py-20 px-6 md:px-10">
                <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                            Unlock the Power of Your People Data
                        </h2>
                        <p className="mt-6 text-lg md:text-xl text-text-secondary">
                            Peoplelytics is the all-in-one platform to visualize, analyze, and predict your workforce trends, empowering you to make smarter, more strategic HR decisions.
                        </p>
                    </div>
                     <div className="rounded-lg overflow-hidden shadow-2xl shadow-primary-900/30 transform hover:scale-105 transition-transform duration-300">
                        <img src="/images/dashboard-preview.png" alt="Peoplelytics Dashboard Preview" className="w-full h-full object-cover"/>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need for data-driven HR</h3>
                        <p className="mt-4 text-lg text-text-secondary">From executive dashboards to predictive AI models.</p>
                    </div>
                    <div className="space-y-20">
                        {DETAILED_FEATURES.map((feature, index) => {
                             const Icon = feature.icon;
                            return (
                                <div key={feature.name} className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                                    <div className={`rounded-lg overflow-hidden shadow-lg shadow-primary-900/20 ${index % 2 === 1 ? 'md:order-last' : ''}`}>
                                        <img src={feature.imageUrl} alt={`${feature.name} screenshot`} className="w-full h-full object-cover"/>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary-900/50 rounded-lg">
                                                <Icon className="h-6 w-6 text-primary-400" />
                                            </div>
                                            <h4 className="text-2xl font-bold">{feature.name}</h4>
                                        </div>
                                        <p className="text-text-secondary text-lg">{feature.description}</p>
                                        <ul className="space-y-3 pt-2">
                                            {feature.subFeatures.map(sub => (
                                                <li key={sub} className="flex items-start gap-3">
                                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/>
                                                    <span className="text-text-secondary">{sub}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            </main>

            {/* Call to Action Section */}
            <section className="py-20 bg-card/50">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to Transform Your HR Strategy?</h3>
                    <p className="mt-4 text-lg text-text-secondary">
                        Join leading organizations who use Peoplelytics to build a better workplace.
                    </p>
                    <Link to="/pricing">
                        <Button size="default" className="mt-8 text-lg px-8 py-3 group">
                            Get Started Now
                            <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 md:px-10 border-t border-border">
                <div className="max-w-6xl mx-auto text-center text-text-secondary text-sm">
                    <p>&copy; {new Date().getFullYear()} Peoplelytics. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;