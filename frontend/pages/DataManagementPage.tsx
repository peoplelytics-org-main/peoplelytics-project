import React, { useState } from 'react';
import { Database, UploadCloud, TestTube2, FileDown, Zap, FileCog } from 'lucide-react';

// Import the tab components
import ImportTab from '../components/data-management/ImportTab';
import AnalysisTab from '../components/data-management/AnalysisTab';
import ExportTab from '../components/data-management/ExportTab';
import IntegrationsTab from '../components/data-management/IntegrationsTab';
import ConverterTab from '../components/data-management/ConverterTab';

type ActiveTab = 'import' | 'analysis' | 'export' | 'integrations' | 'convert';

const TABS: { id: ActiveTab; name: string; icon: React.FC<any> }[] = [
    { id: 'import', name: 'Import Data', icon: UploadCloud },
    { id: 'export', name: 'Export Data', icon: FileDown },
    { id: 'convert', name: 'Excel to CSV', icon: FileCog },
    { id: 'analysis', name: 'Run Analysis', icon: TestTube2 },
    { id: 'integrations', name: 'Integrations', icon: Zap },
];

const DataManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('import');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary-900/50 rounded-lg">
                    <Database className="h-8 w-8 text-primary-400"/>
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-primary">Data Management</h2>
                    <p className="text-text-secondary mt-1">Import, export, analyze, and manage your organization's data.</p>
                 </div>
            </div>
            
            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}`}
                        >
                            <tab.icon className="mr-2 h-5 w-5" />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="pt-4">
                {activeTab === 'import' && <ImportTab />}
                {activeTab === 'analysis' && <AnalysisTab />}
                {activeTab === 'export' && <ExportTab />}
                {activeTab === 'integrations' && <IntegrationsTab />}
                {activeTab === 'convert' && <ConverterTab />}
            </div>
        </div>
    );
}

export default DataManagementPage;
