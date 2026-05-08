"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

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
  const { showToast } = useToast();
  const [settings, setSettings] = useState<FeatureSetting[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/settings", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { setSettings(data); setLoading(false); })
      .catch((e) => { if (e?.name !== "AbortError") setLoading(false); });
    return () => controller.abort();
  }, []);

  function updateSetting(key: string, value: string) {
    setSettings(settings.map((s) => s.key === key ? { ...s, value } : s));
  }

  async function handleSave() {
    const taxSetting = settings.find((s) => s.key === "default_tax_rate");
    if (taxSetting) {
      const rate = Number(taxSetting.value);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        showToast("Default tax rate must be a number between 0 and 100", "error");
        return;
      }
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: settings.map((s) => ({ key: s.key, value: s.value })),
        }),
      });
      if (res.ok) {
        showToast("Settings saved successfully", "success");
      } else {
        const data = await res.json().catch(() => null);
        showToast(data?.error || "Failed to save settings", "error");
      }
    } catch {
      showToast("An unexpected error occurred", "error");
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

      <div className="bg-white rounded-xl border border-gray-200 divide-y">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="w-8 h-8 mx-auto mb-3 text-gray-300 animate-spin" />
            <p className="text-sm text-gray-400">Loading settings...</p>
          </div>
        ) : settings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No settings found</p>
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
