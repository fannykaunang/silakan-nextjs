// app/(dashboard)/settings/app/_client.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Info,
  Phone,
  Mail,
  Palette,
  Building2,
  Database,
  Shield,
  FileText,
  Share2,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Server,
  Loader2,
  Check,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface AppSettings {
  id: number;
  nama_aplikasi: string;
  alias_aplikasi: string;
  deskripsi: string;
  versi: string;
  copyright: string;
  tahun: number;
  logo: string | null;
  favicon: string | null;
  email: string;
  no_telepon: string;
  whatsapp: string | null;
  alamat: string;
  domain: string;
  mode: "online" | "offline" | "maintenance";
  maintenance_message: string | null;
  eabsen_api_url: string;
  eabsen_sync_interval: number;
  eabsen_last_sync: Date | null;
  eabsen_active: boolean;
  timezone: string;
  bahasa_default: string;
  database_version: string | null;
  max_upload_size: number;
  allowed_extensions: string[] | null;
  meta_keywords: string | null;
  meta_description: string | null;
  og_image: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_from_name: string | null;
  notifikasi_email: string | null;
  session_timeout: number;
  password_min_length: number;
  max_login_attempts: number;
  lockout_duration: number;
  enable_2fa: boolean;
  max_edit_days: number;
  working_days: number[] | null;
  theme_color: string;
  sidebar_collapsed: boolean;
  items_per_page: number;
  date_format: string;
  time_format: string;
  instansi_nama: string | null;
  kepala_dinas: string | null;
  nip_kepala_dinas: string | null;
  pimpinan_wilayah: string | null;
  logo_pemda: string | null;
  backup_auto: boolean;
  backup_interval: number;
  last_backup: Date | null;
  log_activity: boolean;
  log_retention_days: number;
  created_at: Date;
  updated_at: Date;
  updated_by: number | null;
}

interface LaporanSetting {
  setting_id: number;
  setting_key: string;
  setting_value: string;
  setting_type: "String" | "Number" | "Boolean" | "JSON";
  deskripsi: string | null;
  kategori_setting: string | null;
  is_editable: 0 | 1;
  created_at: string | null;
  updated_at: string | null;
}

const BOOLEAN_FIELDS: (keyof Pick<
  AppSettings,
  | "eabsen_active"
  | "enable_2fa"
  | "sidebar_collapsed"
  | "backup_auto"
  | "log_activity"
>)[] = [
  "eabsen_active",
  "enable_2fa",
  "sidebar_collapsed",
  "backup_auto",
  "log_activity",
];

const normalizeBooleanFields = (
  data: Partial<AppSettings>
): Partial<AppSettings> => {
  const normalized = { ...data };
  BOOLEAN_FIELDS.forEach((field) => {
    if (normalized[field] !== undefined && normalized[field] !== null) {
      normalized[field] = Boolean(
        normalized[field]
      ) as AppSettings[typeof field];
    }
  });
  return normalized;
};

type TabKey =
  | "general"
  | "contact"
  | "integration"
  | "security"
  | "email"
  | "ui"
  | "organization"
  | "reports"
  | "system";

export default function SettingsPageClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [formData, setFormData] = useState<Partial<AppSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // State untuk laporan settings
  const [laporanSettings, setLaporanSettings] = useState<LaporanSetting[]>([]);
  const [laporanLoading, setLaporanLoading] = useState(false);
  const [laporanFormData, setLaporanFormData] = useState<Record<number, any>>(
    {}
  );
  const [laporanOriginalData, setLaporanOriginalData] = useState<
    Record<number, any>
  >({});

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "reports") {
      fetchLaporanSettings();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/app");
      const result = await response.json();

      if (result.success) {
        const normalizedData = normalizeBooleanFields(
          result.data as AppSettings
        ) as AppSettings;
        setSettings(normalizedData);
        setFormData(normalizedData);
      } else {
        showMessage("error", "Gagal memuat pengaturan");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      showMessage("error", "Terjadi kesalahan saat memuat pengaturan");
    } finally {
      setLoading(false);
    }
  };

  const fetchLaporanSettings = async () => {
    setLaporanLoading(true);
    try {
      const response = await fetch("/api/settings/laporan-kegiatan");
      const result = await response.json();

      if (result.success) {
        setLaporanSettings(result.data);

        // Initialize form data
        const initialData: Record<number, any> = {};
        result.data.forEach((setting: LaporanSetting) => {
          initialData[setting.setting_id] = toDisplayValue(setting);
        });
        setLaporanFormData(initialData);
        setLaporanOriginalData(initialData);
      }
    } catch (error) {
      console.error("Error fetching laporan settings:", error);
    } finally {
      setLaporanLoading(false);
    }
  };

  const toDisplayValue = (setting: LaporanSetting): any => {
    const rawValue = setting.setting_value ?? "";

    switch (setting.setting_type) {
      case "Boolean": {
        const normalized = rawValue.trim().toLowerCase();
        return ["true", "1", "yes", "ya"].includes(normalized);
      }
      case "JSON": {
        try {
          return JSON.parse(rawValue);
        } catch (error) {
          return rawValue;
        }
      }
      case "Number":
        return rawValue;
      case "String":
      default:
        return rawValue;
    }
  };

  const handleInputChange = (field: keyof AppSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleLaporanChange = (settingId: number, value: any) => {
    setLaporanFormData((prev) => ({ ...prev, [settingId]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = normalizeBooleanFields(formData);
      const response = await fetch("/api/settings/app", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        const normalizedData = normalizeBooleanFields(
          result.data as AppSettings
        ) as AppSettings;
        setSettings(normalizedData);
        setFormData(normalizedData);
        setHasChanges(false);
        showMessage("success", "Pengaturan berhasil disimpan");
      } else {
        showMessage("error", result.error || "Gagal menyimpan pengaturan");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showMessage("error", "Terjadi kesalahan saat menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLaporanSetting = async (setting: LaporanSetting) => {
    if (!setting.is_editable) return;

    const id = setting.setting_id;
    const value = laporanFormData[id];

    try {
      const response = await fetch(`/api/settings/laporan-kegiatan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setting_value: value }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedSetting = result.data;
        setLaporanSettings((prev) =>
          prev.map((item) =>
            item.setting_id === updatedSetting.setting_id
              ? updatedSetting
              : item
          )
        );

        const displayValue = toDisplayValue(updatedSetting);
        setLaporanFormData((prev) => ({ ...prev, [id]: displayValue }));
        setLaporanOriginalData((prev) => ({ ...prev, [id]: displayValue }));

        showMessage("success", "Pengaturan laporan berhasil disimpan");
      } else {
        showMessage(
          "error",
          result.message || "Gagal menyimpan pengaturan laporan"
        );
      }
    } catch (error) {
      console.error("Error saving laporan setting:", error);
      showMessage("error", "Terjadi kesalahan saat menyimpan");
    }
  };

  const handleResetLaporanSetting = (settingId: number) => {
    setLaporanFormData((prev) => ({
      ...prev,
      [settingId]: laporanOriginalData[settingId],
    }));
  };

  const isLaporanDirty = (settingId: number) => {
    const current = laporanFormData[settingId];
    const original = laporanOriginalData[settingId];
    return String(current ?? "") !== String(original ?? "");
  };

  const handleReset = () => {
    if (settings) {
      setFormData(settings);
      setHasChanges(false);
      showMessage("success", "Perubahan dibatalkan");
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const tabs = [
    { key: "general" as TabKey, label: "Umum", icon: Info },
    { key: "contact" as TabKey, label: "Kontak", icon: Phone },
    { key: "integration" as TabKey, label: "Integrasi", icon: Server },
    { key: "security" as TabKey, label: "Keamanan", icon: Shield },
    { key: "email" as TabKey, label: "Email", icon: Mail },
    { key: "ui" as TabKey, label: "Tampilan", icon: Palette },
    { key: "organization" as TabKey, label: "Organisasi", icon: Building2 },
    { key: "reports" as TabKey, label: "Laporan", icon: FileText },
    { key: "system" as TabKey, label: "Sistem", icon: Database },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pengaturan Aplikasi
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola konfigurasi dan pengaturan sistem SILAKAN
          </p>
        </div>

        {/* Toast Message */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
            }`}>
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}>
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {activeTab === "general" && (
            <GeneralTab formData={formData} onChange={handleInputChange} />
          )}
          {activeTab === "contact" && (
            <ContactTab formData={formData} onChange={handleInputChange} />
          )}
          {activeTab === "integration" && (
            <IntegrationTab formData={formData} onChange={handleInputChange} />
          )}
          {activeTab === "security" && (
            <SecurityTab formData={formData} onChange={handleInputChange} />
          )}
          {activeTab === "email" && (
            <EmailTab formData={formData} onChange={handleInputChange} />
          )}
          {activeTab === "ui" && (
            <UITab formData={formData} onChange={handleInputChange} />
          )}
          {activeTab === "organization" && (
            <OrganizationTab formData={formData} onChange={handleInputChange} />
          )}
          {activeTab === "reports" && (
            <ReportsTab
              formData={formData}
              onChange={handleInputChange}
              laporanSettings={laporanSettings}
              laporanLoading={laporanLoading}
              laporanFormData={laporanFormData}
              onLaporanChange={handleLaporanChange}
              onSaveLaporanSetting={handleSaveLaporanSetting}
              onResetLaporanSetting={handleResetLaporanSetting}
              isLaporanDirty={isLaporanDirty}
            />
          )}
          {activeTab === "system" && (
            <SystemTab formData={formData} onChange={handleInputChange} />
          )}
        </div>

        {/* Action Buttons - Only for non-reports tabs */}
        {hasChanges && activeTab !== "reports" && (
          <div className="fixed bottom-6 right-6 flex gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50">
              <RefreshCw className="w-4 h-4" />
              Batalkan
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan Perubahan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Tab Components untuk settings (Part 2)
// Letakkan setelah main component di part 1

// Import icons yang dibutuhkan sudah ada di part 1

// ===== GENERAL TAB =====
function GeneralTab({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Informasi Umum
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nama Aplikasi *
          </label>
          <input
            type="text"
            value={formData.nama_aplikasi || ""}
            onChange={(e) => onChange("nama_aplikasi", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alias Aplikasi *
          </label>
          <input
            type="text"
            value={formData.alias_aplikasi || ""}
            onChange={(e) => onChange("alias_aplikasi", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Deskripsi
          </label>
          <textarea
            value={formData.deskripsi || ""}
            onChange={(e) => onChange("deskripsi", e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Versi
          </label>
          <input
            type="text"
            value={formData.versi || ""}
            onChange={(e) => onChange("versi", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tahun
          </label>
          <input
            type="number"
            value={formData.tahun || new Date().getFullYear()}
            onChange={(e) => onChange("tahun", parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Copyright
          </label>
          <input
            type="text"
            value={formData.copyright || ""}
            onChange={(e) => onChange("copyright", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mode Aplikasi
          </label>
          <select
            value={formData.mode || "online"}
            onChange={(e) => onChange("mode", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {formData.mode === "maintenance" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pesan Maintenance
            </label>
            <textarea
              value={formData.maintenance_message || ""}
              onChange={(e) => onChange("maintenance_message", e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Sistem sedang dalam maintenance..."
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ===== CONTACT TAB =====
function ContactTab({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Informasi Kontak
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            No. Telepon *
          </label>
          <input
            type="tel"
            value={formData.no_telepon || ""}
            onChange={(e) => onChange("no_telepon", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            WhatsApp
          </label>
          <input
            type="tel"
            value={formData.whatsapp || ""}
            onChange={(e) => onChange("whatsapp", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="628123456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Domain
          </label>
          <input
            type="text"
            value={formData.domain || ""}
            onChange={(e) => onChange("domain", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="silakan.merauke.go.id"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alamat
          </label>
          <textarea
            value={formData.alamat || ""}
            onChange={(e) => onChange("alamat", e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <h3 className="md:col-span-2 text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Media Sosial
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Facebook URL
          </label>
          <input
            type="url"
            value={formData.facebook_url || ""}
            onChange={(e) => onChange("facebook_url", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://facebook.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Instagram URL
          </label>
          <input
            type="url"
            value={formData.instagram_url || ""}
            onChange={(e) => onChange("instagram_url", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://instagram.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Twitter URL
          </label>
          <input
            type="url"
            value={formData.twitter_url || ""}
            onChange={(e) => onChange("twitter_url", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://twitter.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            YouTube URL
          </label>
          <input
            type="url"
            value={formData.youtube_url || ""}
            onChange={(e) => onChange("youtube_url", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://youtube.com/..."
          />
        </div>
      </div>
    </div>
  );
}

// ===== INTEGRATION TAB =====
function IntegrationTab({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Integrasi E-NTAGO
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL API E-NTAGO *
          </label>
          <input
            type="url"
            value={formData.eabsen_api_url || ""}
            onChange={(e) => onChange("eabsen_api_url", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://dev.api.eabsen.merauke.go.id/api"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Interval Sinkronisasi (menit)
          </label>
          <input
            type="number"
            value={formData.eabsen_sync_interval || 60}
            onChange={(e) =>
              onChange("eabsen_sync_interval", parseInt(e.target.value))
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="1"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.eabsen_active || false}
              onChange={(e) => onChange("eabsen_active", e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktifkan Integrasi eAbsen
            </span>
          </label>
        </div>

        {formData.eabsen_last_sync && (
          <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Sinkronisasi terakhir:{" "}
              {new Date(formData.eabsen_last_sync).toLocaleString("id-ID")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== SECURITY TAB =====
function SecurityTab({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Pengaturan Keamanan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Timeout (menit)
          </label>
          <input
            type="number"
            value={formData.session_timeout || 120}
            onChange={(e) =>
              onChange("session_timeout", parseInt(e.target.value))
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="5"
            max="1440"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Panjang Minimal Password
          </label>
          <input
            type="number"
            value={formData.password_min_length || 8}
            onChange={(e) =>
              onChange("password_min_length", parseInt(e.target.value))
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="6"
            max="32"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Maksimal Percobaan Login
          </label>
          <input
            type="number"
            value={formData.max_login_attempts || 3}
            onChange={(e) =>
              onChange("max_login_attempts", parseInt(e.target.value))
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="1"
            max="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Durasi Lockout (menit)
          </label>
          <input
            type="number"
            value={formData.lockout_duration || 15}
            onChange={(e) =>
              onChange("lockout_duration", parseInt(e.target.value))
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="1"
            max="60"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enable_2fa || false}
              onChange={(e) => onChange("enable_2fa", e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktifkan Two-Factor Authentication (2FA)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

// Continue to part 3...
// Tab Components lanjutan untuk settings-page.tsx
// Tambahkan code ini setelah part 2

// ===== EMAIL TAB =====
function EmailTab({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Konfigurasi Email
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Host
          </label>
          <input
            type="text"
            value={formData.smtp_host || ""}
            onChange={(e) => onChange("smtp_host", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="smtp.gmail.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP Port
          </label>
          <input
            type="number"
            value={formData.smtp_port || ""}
            onChange={(e) => onChange("smtp_port", parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="587"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SMTP User
          </label>
          <input
            type="email"
            value={formData.smtp_user || ""}
            onChange={(e) => onChange("smtp_user", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="noreply@merauke.go.id"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nama Pengirim
          </label>
          <input
            type="text"
            value={formData.smtp_from_name || ""}
            onChange={(e) => onChange("smtp_from_name", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="SILAKAN - Kabupaten Merauke"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Notifikasi
          </label>
          <input
            type="email"
            value={formData.notifikasi_email || ""}
            onChange={(e) => onChange("notifikasi_email", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="admin@merauke.go.id"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Email untuk menerima notifikasi sistem
          </p>
        </div>
      </div>
    </div>
  );
}

// ===== UI TAB =====
function UITab({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Pengaturan Tampilan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Warna Tema
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.theme_color || "#3b82f6"}
              onChange={(e) => onChange("theme_color", e.target.value)}
              className="w-16 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={formData.theme_color || "#3b82f6"}
              onChange={(e) => onChange("theme_color", e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="#3b82f6"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Item per Halaman
          </label>
          <input
            type="number"
            value={formData.items_per_page || 10}
            onChange={(e) =>
              onChange("items_per_page", parseInt(e.target.value))
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="5"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Format Tanggal
          </label>
          <select
            value={formData.date_format || "d-m-Y"}
            onChange={(e) => onChange("date_format", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="d-m-Y">DD-MM-YYYY</option>
            <option value="Y-m-d">YYYY-MM-DD</option>
            <option value="m/d/Y">MM/DD/YYYY</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Format Waktu
          </label>
          <select
            value={formData.time_format || "24h"}
            onChange={(e) => onChange("time_format", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="24h">24 Jam</option>
            <option value="12h">12 Jam (AM/PM)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sidebar_collapsed || false}
              onChange={(e) => onChange("sidebar_collapsed", e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Sidebar Collapsed (Default)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ===== ORGANIZATION TAB =====
function OrganizationTab({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Informasi Organisasi
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nama Instansi
          </label>
          <input
            type="text"
            value={formData.instansi_nama || ""}
            onChange={(e) => onChange("instansi_nama", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Pemerintah Kabupaten Merauke"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kepala Dinas
          </label>
          <input
            type="text"
            value={formData.kepala_dinas || ""}
            onChange={(e) => onChange("kepala_dinas", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            NIP Kepala Dinas
          </label>
          <input
            type="text"
            value={formData.nip_kepala_dinas || ""}
            onChange={(e) => onChange("nip_kepala_dinas", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pimpinan Wilayah (Bupati/Walikota)
          </label>
          <input
            type="text"
            value={formData.pimpinan_wilayah || ""}
            onChange={(e) => onChange("pimpinan_wilayah", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}

// ===== SYSTEM TAB =====
function SystemTab({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Pengaturan Sistem
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone || "Asia/Jayapura"}
            onChange={(e) => onChange("timezone", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
            <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
            <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bahasa Default
          </label>
          <select
            value={formData.bahasa_default || "id"}
            onChange={(e) => onChange("bahasa_default", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Maksimal Upload Size (MB)
          </label>
          <input
            type="number"
            value={formData.max_upload_size || 5}
            onChange={(e) =>
              onChange("max_upload_size", parseInt(e.target.value))
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="1"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Interval Backup (hari)
          </label>
          <input
            type="number"
            value={formData.backup_interval || 7}
            onChange={(e) =>
              onChange("backup_interval", parseInt(e.target.value))
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="1"
            max="365"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Retensi Log (hari)
          </label>
          <input
            type="number"
            value={formData.log_retention_days || 90}
            onChange={(e) =>
              onChange("log_retention_days", parseInt(e.target.value))
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="1"
            max="365"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.backup_auto || false}
              onChange={(e) => onChange("backup_auto", e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto Backup
            </span>
          </label>
        </div>

        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.log_activity || false}
              onChange={(e) => onChange("log_activity", e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktifkan Activity Log
            </span>
          </label>
        </div>

        {formData.last_backup && (
          <div className="md:col-span-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Backup terakhir:{" "}
              {new Date(formData.last_backup).toLocaleString("id-ID")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ContactTab, IntegrationTab, SecurityTab, EmailTab, UITab, OrganizationTab, SystemTab
// sama seperti sebelumnya (copy dari file sebelumnya)
// ...

// ===== REPORTS TAB (INTEGRATED WITH LAPORAN SETTINGS) =====
function ReportsTab({
  formData,
  onChange,
  laporanSettings,
  laporanLoading,
  laporanFormData,
  onLaporanChange,
  onSaveLaporanSetting,
  onResetLaporanSetting,
  isLaporanDirty,
}: any) {
  const weekDays = [
    { value: 1, label: "Senin" },
    { value: 2, label: "Selasa" },
    { value: 3, label: "Rabu" },
    { value: 4, label: "Kamis" },
    { value: 5, label: "Jumat" },
    { value: 6, label: "Sabtu" },
    { value: 0, label: "Minggu" },
  ];

  const toggleWorkingDay = (day: number) => {
    const current = formData.working_days || [1, 2, 3, 4, 5];
    const updated = current.includes(day)
      ? current.filter((d: number) => d !== day)
      : [...current, day];
    onChange("working_days", updated);
  };

  const formatSettingLabel = (key: string): string => {
    return key
      .replace(/[_-]+/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Group laporan settings by category
  const groupedLaporanSettings = laporanSettings.reduce(
    (acc: any, setting: any) => {
      const category = setting.kategori_setting || "Lainnya";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(setting);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Pengaturan Laporan Kegiatan
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Kelola pengaturan terkait laporan kegiatan harian ASN
        </p>
      </div>

      {/* Section 1: App Settings (max_edit_days & working_days) */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Pengaturan Umum Laporan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maksimal Hari Edit Laporan
            </label>
            <input
              type="number"
              value={formData.max_edit_days || 3}
              onChange={(e) =>
                onChange("max_edit_days", parseInt(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="0"
              max="30"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              0 = hanya bisa edit di hari yang sama
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Hari Kerja
            </label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleWorkingDay(day.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    (formData.working_days || [1, 2, 3, 4, 5]).includes(
                      day.value
                    )
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}>
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Laporan Settings from settings_laporan_kegiatan */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Pengaturan Detail Laporan
        </h3>

        {laporanLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Memuat pengaturan...
            </span>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLaporanSettings).map(
              ([category, settings]: [string, any]) => (
                <div
                  key={category}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    {category}
                  </h4>

                  <div className="space-y-4">
                    {settings.map((setting: any) => {
                      const id = setting.setting_id;
                      const value = laporanFormData[id];
                      const editable = setting.is_editable === 1;
                      const dirty = isLaporanDirty(id);

                      return (
                        <div
                          key={setting.setting_id}
                          className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {formatSettingLabel(setting.setting_key)}
                                </span>
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                  {setting.setting_type}
                                </span>
                                {!editable && (
                                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                    Hanya baca
                                  </span>
                                )}
                              </div>
                              {setting.deskripsi && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {setting.deskripsi}
                                </p>
                              )}
                            </div>

                            {setting.updated_at && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Check className="w-4 h-4" />
                                <span>
                                  {new Date(setting.updated_at).toLocaleString(
                                    "id-ID",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            {setting.setting_type === "Boolean" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  editable && onLaporanChange(id, !value)
                                }
                                disabled={!editable}
                                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                                  value
                                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-200"
                                    : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                } ${
                                  !editable
                                    ? "cursor-not-allowed opacity-60"
                                    : "hover:border-blue-300"
                                }`}>
                                {value ? (
                                  <ToggleRight className="w-5 h-5" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5" />
                                )}
                                <span>{value ? "Aktif" : "Nonaktif"}</span>
                              </button>
                            ) : (
                              <input
                                type={
                                  setting.setting_type === "Number"
                                    ? "number"
                                    : "text"
                                }
                                value={value || ""}
                                onChange={(e) =>
                                  editable &&
                                  onLaporanChange(id, e.target.value)
                                }
                                disabled={!editable}
                                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                              />
                            )}
                          </div>

                          {editable && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => onResetLaporanSetting(id)}
                                disabled={!dirty}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                <RefreshCw className="w-4 h-4" />
                                Reset
                              </button>
                              <button
                                type="button"
                                onClick={() => onSaveLaporanSetting(setting)}
                                disabled={!dirty}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                                <Save className="w-4 h-4" />
                                Simpan
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
