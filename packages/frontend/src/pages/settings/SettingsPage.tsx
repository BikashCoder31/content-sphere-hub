import { useState, useEffect } from 'react';
import {
  useGetSettingsGroupedQuery,
  useUpdateSettingMutation,
  useResetSettingMutation,
  Setting,
  SettingsCategory,
} from '@/store/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Settings,
  Globe,
  Search,
  FileText,
  Image,
  Shield,
  Mail,
  Palette,
  Loader2,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_CONFIG: Record<SettingsCategory, { label: string; icon: typeof Settings; description: string }> = {
  general: { label: 'General', icon: Globe, description: 'Site name, URL, and basic settings' },
  seo: { label: 'SEO', icon: Search, description: 'Search engine optimization settings' },
  content: { label: 'Content', icon: FileText, description: 'Content defaults and limits' },
  media: { label: 'Media', icon: Image, description: 'Upload limits and image settings' },
  security: { label: 'Security', icon: Shield, description: 'Authentication and security options' },
  email: { label: 'Email', icon: Mail, description: 'Email delivery configuration' },
  appearance: { label: 'Appearance', icon: Palette, description: 'Theme and display settings' },
};

const CATEGORIES: SettingsCategory[] = ['general', 'seo', 'content', 'media', 'security', 'email', 'appearance'];

function SettingField({ setting, onSave }: { setting: Setting; onSave: (key: string, value: unknown) => Promise<void> }) {
  const [value, setValue] = useState<string>(
    typeof setting.value === 'object' ? JSON.stringify(setting.value, null, 2) : String(setting.value ?? '')
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resetSetting] = useResetSettingMutation();

  useEffect(() => {
    setValue(typeof setting.value === 'object' ? JSON.stringify(setting.value, null, 2) : String(setting.value ?? ''));
  }, [setting.value]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let parsedValue: unknown = value;
      if (setting.type === 'number') parsedValue = Number(value);
      else if (setting.type === 'boolean') parsedValue = value === 'true';
      else if (setting.type === 'json' || setting.type === 'array') parsedValue = JSON.parse(value);
      await onSave(setting.key, parsedValue);
      setIsEditing(false);
    } catch {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      await resetSetting(setting.key).unwrap();
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = () => {
    if (setting.type === 'boolean') {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => setValue(e.target.checked ? 'true' : 'false')}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{value === 'true' ? 'Enabled' : 'Disabled'}</span>
        </label>
      );
    }

    if (setting.type === 'json' || setting.type === 'array') {
      return (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      );
    }

    return (
      <Input
        type={setting.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="max-w-md"
      />
    );
  };

  return (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 dark:text-white">{setting.label}</h4>
            {setting.isPublic && (
              <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">Public</span>
            )}
          </div>
          {setting.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{setting.description}</p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">{setting.key}</p>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3 space-y-3">
          {renderInput()}
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
            {typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value ?? 'Not set')}
          </code>
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsCategory>('general');
  const { data: settingsGrouped, isLoading, error, refetch } = useGetSettingsGroupedQuery();
  const [updateSetting] = useUpdateSettingMutation();
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = async (key: string, value: unknown) => {
    try {
      await updateSetting({ key, value }).unwrap();
      setSaveStatus({ type: 'success', message: 'Setting saved successfully' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus({ type: 'error', message: 'Failed to save setting' });
      setTimeout(() => setSaveStatus(null), 3000);
      throw new Error('Failed to save');
    }
  };

  const activeSettings = settingsGrouped?.[activeTab] || [];
  const ActiveIcon = CATEGORY_CONFIG[activeTab].icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure your site settings and preferences</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RotateCcw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Save Status Toast */}
      {saveStatus && (
        <div className={cn(
          'fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg',
          saveStatus.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        )}>
          {saveStatus.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {saveStatus.message}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {CATEGORIES.map((category) => {
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              const count = settingsGrouped?.[category]?.length || 0;
              return (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    activeTab === category
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-2 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{config.label}</span>
                  {count > 0 && (
                    <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Category Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <ActiveIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {CATEGORY_CONFIG[activeTab].label}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {CATEGORY_CONFIG[activeTab].description}
                </p>
              </div>
            </div>
          </div>

          {/* Settings List */}
          <div className="px-6">
            {isLoading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Failed to load settings</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                  Try Again
                </Button>
              </div>
            ) : activeSettings.length === 0 ? (
              <div className="py-12 text-center">
                <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No settings in this category</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {activeSettings.map((setting) => (
                  <SettingField key={setting.key} setting={setting} onSave={handleSave} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
