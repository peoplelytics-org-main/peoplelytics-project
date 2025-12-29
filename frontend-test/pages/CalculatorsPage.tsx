
import React, { useState, useEffect, useMemo } from 'react';
import { EMPLOYEE_METRIC_CATEGORIES, HR_METRIC_CATEGORIES } from '../components/calculators/calculatorConfig';
import CalculatorCard from '../components/calculators/CalculatorCard';
import MetricExplanationCard from '../components/calculators/MetricExplanationCard';

interface CalculatorsPageProps {
  pageType: 'employee' | 'hr';
}

const CalculatorsPage: React.FC<CalculatorsPageProps> = ({ pageType }) => {
  
  const categoriesToDisplay = useMemo(() => 
    pageType === 'employee' ? EMPLOYEE_METRIC_CATEGORIES : HR_METRIC_CATEGORIES,
    [pageType]
  );
  
  const [activeTab, setActiveTab] = useState(categoriesToDisplay[0].name);
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);

  const activeCategory = useMemo(() => 
    categoriesToDisplay.find(cat => cat.name === activeTab),
    [activeTab, categoriesToDisplay]
  );
  
  // Reset tabs when pageType changes
  useEffect(() => {
    setActiveTab(categoriesToDisplay[0].name);
  }, [pageType, categoriesToDisplay]);

  // Set the default sub-tab when the main category changes
  useEffect(() => {
    if (activeCategory && activeCategory.calculators.length > 0) {
      setActiveSubTab(activeCategory.calculators[0].title);
    } else {
      setActiveSubTab(null);
    }
  }, [activeCategory]);

  const activeCalculator = useMemo(() => {
    if (!activeCategory || !activeSubTab) return null;
    return activeCategory.calculators.find(calc => calc.title === activeSubTab);
  }, [activeCategory, activeSubTab]);

  const pageTitle = pageType === 'employee' ? 'Employee Metrics' : 'HR Metrics';
  const pageDescription = pageType === 'employee' 
    ? 'Tools to calculate metrics related to the employee lifecycle and experience.'
    : 'Tools to measure the efficiency and strategic impact of the HR function.';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-text-primary">{pageTitle} Calculators</h2>
        <p className="text-text-secondary mt-1">{pageDescription}</p>
      </div>

      {/* Main Category Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {categoriesToDisplay.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.name}
                onClick={() => setActiveTab(category.name)}
                className={`
                  ${activeTab === category.name
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'
                  }
                  group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                `}
              >
                <Icon className="mr-2 h-5 w-5" />
                <span>{category.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Sub-Category Tabs */}
      {activeCategory && activeCategory.calculators.length > 1 && (
        <div className="pt-4">
            <nav className="flex space-x-2 overflow-x-auto" aria-label="Sub-tabs">
                {activeCategory.calculators.map((calculator) => (
                    <button
                        key={calculator.title}
                        onClick={() => setActiveSubTab(calculator.title)}
                        className={`
                          ${activeSubTab === calculator.title
                            ? 'bg-primary-600 text-white'
                            : 'bg-card text-text-secondary hover:bg-card/70 hover:text-text-primary'
                          }
                          py-2 px-4 font-medium text-sm rounded-md transition-colors duration-200 whitespace-nowrap
                        `}
                    >
                        {calculator.title}
                    </button>
                ))}
            </nav>
        </div>
      )}


      {/* Calculator Display */}
       <div className="pt-2">
        {activeCalculator && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="lg:col-span-1">
                    <CalculatorCard key={activeCalculator.title} {...activeCalculator} />
                </div>
                <div className="lg:col-span-1">
                    <MetricExplanationCard
                        key={`${activeCalculator.title}-explanation`}
                        title={activeCalculator.title}
                        explanation={activeCalculator.explanation}
                        formula={activeCalculator.formula}
                    />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorsPage;
