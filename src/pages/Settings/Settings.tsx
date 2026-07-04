import React, { useState } from 'react';
import { Save, Bell, Shield, Monitor, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
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
    <div className="page-shell">
      <PageHeader
        title="Settings"
        description="Manage your application preferences."
      />

      <div className="flex flex-col md:flex-row gap-5">
        <Card padding="sm" className="w-full md:w-60 shrink-0 h-fit">
          <nav className="space-y-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-item ${activeTab === tab.id ? 'tab-item-active' : 'tab-item-inactive'}`}
              >
                <tab.icon size={17} strokeWidth={1.75} />
                {tab.label}
              </button>
            ))}
          </nav>
        </Card>

        <div className="flex-1 min-w-0">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-4">
                  <Input label="Site Name" defaultValue="AdminPro SaaS" />
                  <Input label="Support Email" type="email" defaultValue="support@example.com" />

                  <div>
                    <label className="form-label">Site Description</label>
                    <textarea
                      className="form-textarea"
                      rows={4}
                      defaultValue="A premium admin panel dashboard for SaaS applications."
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button onClick={handleSave} isLoading={isLoading}>
                    <Save size={16} />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'localization' && (
            <Card>
              <CardContent>
                <LanguageSelector />
              </CardContent>
            </Card>
          )}

          {activeTab !== 'general' && activeTab !== 'localization' && (
            <Card>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Monitor size={40} className="mb-4 text-text-muted opacity-40" strokeWidth={1.5} />
                <p className="text-sm text-text-secondary">
                  This settings panel is a placeholder for the &ldquo;{activeTab}&rdquo; tab.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;