import React, { useState } from 'react';
import type { Organization } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { X } from 'lucide-react';

const OrgFormModal: React.FC<{
    org: Organization | null, 
    onSubmit: (data: { name: string, duration?: number, subscriptionEndDate?: string }) => void, 
    onClose: () => void
}> = ({ org, onSubmit, onClose }) => {
    const [name, setName] = useState(org?.name || '');
    const [duration, setDuration] = useState(6);
    const [endDate, setEndDate] = useState(org?.subscriptionEndDate || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (org) {
            onSubmit({ name, subscriptionEndDate: endDate });
        } else {
            onSubmit({ name, duration });
        }
    };
    
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>{org ? 'Edit' : 'Add'} Organization</CardTitle>
                        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-border"><X className="h-4 w-4"/></button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input label="Organization Name" value={name} onChange={e => setName(e.target.value)} required />
                        {org ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Subscription Start Date</label>
                                    <p className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-secondary cursor-not-allowed">{org.subscriptionStartDate}</p>
                                </div>
                                <Input 
                                    label="Subscription End Date" 
                                    type="date" 
                                    value={endDate} 
                                    onChange={e => setEndDate(e.target.value)} 
                                    min={todayStr}
                                    required 
                                />
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Subscription Period</label>
                                <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary">
                                    <option value={6}>6 Months</option>
                                    <option value={12}>12 Months</option>
                                </select>
                            </div>
                        )}
                    </CardContent>
                    <div className="p-4 flex justify-end gap-2 border-t border-border">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default OrgFormModal;
