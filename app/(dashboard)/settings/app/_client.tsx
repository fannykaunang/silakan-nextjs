// app/(dashboard)/settings/app/page.tsx
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
  auto_approve_laporan: boolean;
  max_edit_days: number;
  reminder_time: string;
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

const BOOLEAN_FIELDS: (keyof Pick<
  AppSettings,
  | "eabsen_active"
  | "enable_2fa"
  | "auto_approve_laporan"
  | "sidebar_collapsed"
  | "backup_auto"
  | "log_activity"
>)[] = [
  "eabsen_active",
  "enable_2fa",
  "auto_approve_laporan",
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

  useEffect(() => {
    fetchSettings();
  }, []);

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

  const handleInputChange = (field: keyof AppSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
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
            <ReportsTab formData={formData} onChange={handleInputChange} />
          )}
          {activeTab === "system" && (
            <SystemTab formData={formData} onChange={handleInputChange} />
          )}
        </div>

        {/* Action Buttons */}
        {hasChanges && (
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

// Tab Components will continue in next part...
// Tab Components untuk settings-page.tsx
// Tambahkan code ini setelah main component di settings-page-part1.tsx

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
        Integrasi eAbsen
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL API eAbsen *
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

// ===== REPORTS TAB =====
function ReportsTab({ formData, onChange }: any) {
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Pengaturan Laporan
      </h2>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Waktu Reminder
          </label>
          <input
            type="time"
            value={
              formData.reminder_time
                ? formData.reminder_time.substring(0, 5)
                : "14:00"
            }
            onChange={(e) => onChange("reminder_time", e.target.value + ":00")}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.auto_approve_laporan || false}
              onChange={(e) =>
                onChange("auto_approve_laporan", e.target.checked)
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto Approve Laporan
            </span>
          </label>
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
                  (formData.working_days || [1, 2, 3, 4, 5]).includes(day.value)
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
