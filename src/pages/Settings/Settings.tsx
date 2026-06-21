import React, { useState } from 'react';
import { Save, Bell, Shield, Monitor, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import LanguageSelector from '../../components/ui/LanguageSelector';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Settings saved successfully!');
    }, 1000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'localization', label: 'Localization', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your application preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-64 shrink-0 h-fit p-2">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-text-secondary hover:text-text hover:bg-surface'
                  }
                `}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </Card>

        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Input label="Site Name" defaultValue="AdminPro SaaS" />
                  <Input label="Support Email" type="email" defaultValue="support@example.com" />
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      Site Description
                    </label>
                    <textarea 
                      className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      rows={4}
                      defaultValue="A premium admin panel dashboard for SaaS applications."
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border flex justify-end">
                  <Button onClick={handleSave} isLoading={isLoading} className="gap-2">
                    <Save size={16} />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'localization' && (
            <LanguageSelector />
          )}

          {activeTab !== 'general' && activeTab !== 'localization' && (
            <Card>
              <div className="flex flex-col items-center justify-center py-12 text-center text-text-secondary">
                <Monitor size={48} className="mb-4 opacity-20" />
                <p>This settings panel is a placeholder for the "{activeTab}" tab.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
