"use client";

import { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";

interface FeatureSetting {
  id: string;
  key: string;
  value: string;
}

const settingLabels: Record<string, { label: string; description: string; type: "toggle" | "text" }> = {
  quotation_enabled: { label: "Quotation Module", description: "Enable quotation creation and management", type: "toggle" },
  po_enabled: { label: "Purchase Order Module", description: "Enable PO upload and tracking", type: "toggle" },
  do_enabled: { label: "Delivery Order Module", description: "Enable delivery order generation", type: "toggle" },
  invoice_enabled: { label: "Invoice Module", description: "Enable invoice generation and payment tracking", type: "toggle" },
  default_tax_rate: { label: "Default Tax Rate (%)", description: "Default tax rate for new documents", type: "text" },
  company_name: { label: "System Name", description: "Name displayed in the application", type: "text" },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<FeatureSetting[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/settings", { signal: controller.signal })
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  function updateSetting(key: string, value: string) {
    setSettings(settings.map((s) => s.key === key ? { ...s, value } : s));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: settings.map((s) => ({ key: s.key, value: s.value })),
        }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure system features and defaults</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          Settings saved successfully
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y">
        {settings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Loading settings...</p>
          </div>
        ) : (
          settings.map((setting) => {
            const meta = settingLabels[setting.key];
            if (!meta) return null;

            return (
              <div key={setting.key} className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-medium text-gray-900">{meta.label}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{meta.description}</p>
                </div>
                {meta.type === "toggle" ? (
                  <button
                    onClick={() => updateSetting(setting.key, setting.value === "true" ? "false" : "true")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      setting.value === "true" ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      setting.value === "true" ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                ) : (
                  <input
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
