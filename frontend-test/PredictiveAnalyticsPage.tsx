import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { FileWarning, Bot, TrendingDown, Star, TrendingUp } from 'lucide-react';
import { FlameIcon } from '../constants';
import Button from '../components/ui/Button';
import TurnoverRiskModel from '../components/predictions/TurnoverRiskModel';
import PerformanceForecastModel from '../components/predictions/PerformanceForecastModel';
import PredictionExplanationCard from '../components/predictions/PredictionExplanationCard';
import KPIForecastModel from '../components/predictions/KPIForecastModel';
import BurnoutRiskModel from '../components/predictions/BurnoutRiskModel';

type ActiveModel = 'turnover' | 'performance' | 'forecasting' | 'burnout';

const PredictiveAnalyticsPage: React.FC = () => {
    const { employeeData, attendanceData } = useData();
    const { currentUser } = useAuth();
    const [activeModel, setActiveModel] = useState<ActiveModel>('turnover');
    
    const canUpload = currentUser?.role === 'Org Admin' || currentUser?.role === 'HR Analyst';

    if (employeeData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-4">
                <FileWarning className="mx-auto h-16 w-16 text-text-secondary" />
                <h3 className="text-xl font-semibold text-text-primary">Employee Data Required</h3>
                <p className="text-text-secondary">
                  {canUpload 
                    ? "Please provide data to use predictive analytics."
                    : "Employee data has not been uploaded yet. Predictive features are unavailable."
                  }
                </p>
                {canUpload && (
                  <div>
                    <Link to="/app/data-management">
                      <Button>Manage Data</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
        );
    }

    const turnoverExplanation = {
        title: "Turnover Risk",
        explanation: "This AI model analyzes key data points for an individual employee to predict the likelihood of them voluntarily leaving the company within the next 6 months. It helps managers proactively identify at-risk employees and implement retention strategies.",
        factors: [
            "Employee's current engagement score",
            "Recent performance rating",
            "Tenure within the company",
            "Job title and department (considers market demand)",
        ]
    };
    
    const performanceExplanation = {
        title: "Performance Forecast",
        explanation: "This AI model forecasts an employee's likely performance trajectory over the next 12 months. It's designed to help with talent management, succession planning, and identifying individuals who may need additional support or development opportunities.",
        factors: [
            "Historical performance ratings",
            "Current employee engagement score",
            "Tenure and time in current role",
            "Job title and its typical progression",
        ]
    };

    const forecastingExplanation = {
        title: "KPI Forecasting",
        explanation: "This AI model uses historical trend data to forecast future outcomes for key metrics like turnover or absenteeism. It provides a projected trend along with a confidence interval, helping leadership anticipate future challenges and plan proactively.",
        factors: [
            "Historical data points for the last 24 months",
            "Seasonality and underlying trends in the data",
            "Statistical forecasting models (e.g., ARIMA)",
        ]
    };

    const burnoutExplanation = {
        title: "Burnout Risk Hotspots",
        explanation: "This model calculates a 'Burnout Risk Score' for every employee and aggregates the results by department. It helps identify which teams are most at risk of burnout, allowing for targeted, preventative interventions.",
        factors: [
            "High weekly hours (workload)",
            "Low employee engagement score",
            "Sustained high-performance (pressure)",
        ]
    };
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary-900/50 rounded-lg">
                    <Bot className="h-8 w-8 text-primary-400"/>
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-primary">Predictive Analytics</h2>
                    <p className="text-text-secondary mt-1">Leverage AI to forecast key HR outcomes and make proactive decisions.</p>
                 </div>
            </div>
            
            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    <button
                        onClick={() => setActiveModel('turnover')}
                        className={`
                          group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                          ${activeModel === 'turnover' ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}
                        `}
                    >
                        <TrendingDown className="mr-2 h-5 w-5" />
                        Turnover Risk
                    </button>
                    <button
                        onClick={() => setActiveModel('performance')}
                        className={`
                          group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                          ${activeModel === 'performance' ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}
                        `}
                    >
                        <Star className="mr-2 h-5 w-5" />
                        Performance Forecast
                    </button>
                    <button
                        onClick={() => setActiveModel('forecasting')}
                        className={`
                          group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                          ${activeModel === 'forecasting' ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}
                        `}
                    >
                        <TrendingUp className="mr-2 h-5 w-5" />
                        KPI Forecasting
                    </button>
                    <button
                        onClick={() => setActiveModel('burnout')}
                        className={`
                          group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                          ${activeModel === 'burnout' ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}
                        `}
                    >
                        <FlameIcon className="mr-2 h-5 w-5" />
                        Burnout Risk Hotspots
                    </button>
                </nav>
            </div>
            
            <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {activeModel === 'turnover' && (
                    <>
                        <TurnoverRiskModel employees={employeeData} />
                        <PredictionExplanationCard {...turnoverExplanation} />
                    </>
                )}
                {activeModel === 'performance' && (
                    <>
                        <PerformanceForecastModel employees={employeeData} />
                        <PredictionExplanationCard {...performanceExplanation} />
                    </>
                )}
                {activeModel === 'forecasting' && (
                     <>
                        <KPIForecastModel employees={employeeData} attendance={attendanceData} />
                        <PredictionExplanationCard {...forecastingExplanation} />
                    </>
                )}
                {activeModel === 'burnout' && (
                     <>
                        <BurnoutRiskModel employees={employeeData} />
                        <PredictionExplanationCard {...burnoutExplanation} />
                    </>
                )}
            </div>
        </div>
    );
}
