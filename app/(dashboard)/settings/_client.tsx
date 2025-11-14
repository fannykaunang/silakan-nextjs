// app/(dashboard)/settings/_client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  RefreshCcw,
  Save,
  Settings2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { Setting } from "@/lib/types";
import { showError, showSuccess } from "@/lib/utils/sweetalert";

interface SettingsResponse {
  success: boolean;
  data?: Setting[];
  message?: string;
}

type FormValue = string | boolean;

type FieldErrorState = Record<number, string | null>;

function toDisplayValue(setting: Setting): FormValue {
  const rawValue = setting.setting_value ?? "";

  switch (setting.setting_type) {
    case "Boolean": {
      const normalized = rawValue.trim().toLowerCase();
      return ["true", "1", "yes", "ya"].includes(normalized);
    }
    case "JSON": {
      try {
        const parsed = JSON.parse(rawValue);
        return JSON.stringify(parsed, null, 2);
      } catch (error) {
        return rawValue;
      }
    }
    case "Number":
    case "String":
    default:
      return rawValue;
  }
}

function formatSettingLabel(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SettingsClient() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<number, FormValue>>({});
  const [originalValues, setOriginalValues] = useState<
    Record<number, FormValue>
  >({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrorState>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const groupedSettings = useMemo(() => {
    const groups = new Map<string, Setting[]>();

    for (const setting of settings) {
      const category = setting.kategori_setting || "Lainnya";
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(setting);
    }

    return Array.from(groups.entries()).map(([category, items]) => ({
      category,
      items: items.sort((a, b) =>
        a.setting_key.localeCompare(b.setting_key, "id", {
          sensitivity: "base",
        })
      ),
    }));
  }, [settings]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/settings", { cache: "no-store" });
        const payload: SettingsResponse = await response.json().catch(() => ({
          success: false,
          message: "Respons tidak valid",
        }));

        if (!response.ok || payload.success !== true || !payload.data) {
          throw new Error(payload.message || "Gagal memuat pengaturan sistem");
        }

        setSettings(payload.data);

        const initialForm: Record<number, FormValue> = {};
        payload.data.forEach((setting) => {
          initialForm[setting.setting_id] = toDisplayValue(setting);
        });
        setFormValues(initialForm);
        setOriginalValues(initialForm);
        setFieldErrors({});
      } catch (err: any) {
        console.error("Failed to load settings:", err);
        setError(err?.message || "Terjadi kesalahan saat memuat pengaturan");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const isDirty = (setting: Setting) => {
    const id = setting.setting_id;
    const current = formValues[id];
    const original = originalValues[id];

    if (setting.setting_type === "Boolean") {
      return Boolean(current) !== Boolean(original);
    }

    return String(current ?? "") !== String(original ?? "");
  };

  const handleChange = (setting: Setting, value: FormValue) => {
    const id = setting.setting_id;
    setFormValues((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: null }));
  };

  const handleReset = (setting: Setting) => {
    const id = setting.setting_id;
    setFormValues((prev) => ({ ...prev, [id]: originalValues[id] }));
    setFieldErrors((prev) => ({ ...prev, [id]: null }));
  };

  const handleSave = async (setting: Setting) => {
    if (!setting.is_editable) {
      return;
    }

    const id = setting.setting_id;
    const value = formValues[id];

    setSavingId(id);
    setFieldErrors((prev) => ({ ...prev, [id]: null }));

    try {
      const response = await fetch(`/api/settings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setting_value: value }),
      });

      const payload = await response.json().catch(() => ({ success: false }));

      if (!response.ok || payload?.success !== true) {
        const message =
          payload?.message || "Gagal memperbarui pengaturan sistem";

        if (response.status === 400) {
          setFieldErrors((prev) => ({ ...prev, [id]: message }));
        } else {
          showError("Gagal", message);
        }
        return;
      }

      const updatedSetting: Setting = payload.data || setting;

      setSettings((prev) =>
        prev.map((item) =>
          item.setting_id === updatedSetting.setting_id ? updatedSetting : item
        )
      );

      const displayValue = toDisplayValue(updatedSetting);
      setFormValues((prev) => ({ ...prev, [id]: displayValue }));
      setOriginalValues((prev) => ({ ...prev, [id]: displayValue }));
      setFieldErrors((prev) => ({ ...prev, [id]: null }));

      showSuccess("Berhasil", "Pengaturan berhasil diperbarui", 1500);
    } catch (err: any) {
      console.error(`Failed to update setting ${setting.setting_key}:`, err);
      showError(
        "Terjadi Kesalahan",
        err?.message || "Pengaturan gagal diperbarui"
      );
    } finally {
      setSavingId(null);
    }
  };

  if (loading && settings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Memuat pengaturan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Pengaturan Laporan Kegiatan
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base">
              Sesuaikan parameter sistem untuk mengatur alur laporan kegiatan,
              verifikasi, dan notifikasi sesuai kebutuhan organisasi Anda.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur">
            <Settings2 className="h-5 w-5" />
            <div>
              <p className="font-semibold">Mode Admin</p>
              <p className="text-xs text-blue-100">
                Hanya administrator yang dapat mengubah pengaturan ini
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {groupedSettings.map(({ category, items }) => (
        <section
          key={category}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
          <header className="flex flex-col gap-3 border-b border-gray-100 pb-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {category}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pengaturan yang berkaitan dengan kategori{" "}
                {category.toLowerCase()}.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <RefreshCcw className="h-4 w-4" />
              <span>Perbarui nilai dan simpan untuk menerapkan perubahan</span>
            </div>
          </header>

          <div className="mt-6 space-y-6">
            {items.map((setting) => {
              const id = setting.setting_id;
              const value =
                formValues[id] ??
                (setting.setting_type === "Boolean" ? false : "");
              const editable = setting.is_editable === 1;
              const dirty = isDirty(setting);
              const hasError = fieldErrors[id];
              const updatedAt = setting.updated_at
                ? new Date(setting.updated_at)
                : null;
              const hasValidDate =
                updatedAt && !Number.isNaN(updatedAt.getTime());

              return (
                <div
                  key={setting.setting_id}
                  className="rounded-xl border border-gray-100 bg-gray-50/60 p-5 dark:border-gray-800 dark:bg-gray-900/40">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <span>{formatSettingLabel(setting.setting_key)}</span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                          {setting.setting_type}
                        </span>
                        {!editable && (
                          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
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
                    {hasValidDate && updatedAt && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Check className="h-4 w-4" />
                        <span>
                          Terakhir diperbarui{" "}
                          {updatedAt.toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    {setting.setting_type === "Boolean" ? (
                      (() => {
                        const isActive = Boolean(value);
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              editable && handleChange(setting, !isActive)
                            }
                            disabled={!editable || savingId === id}
                            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 ${
                              isActive
                                ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-200"
                                : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            } ${
                              !editable || savingId === id
                                ? "cursor-not-allowed opacity-60"
                                : "hover:border-blue-300 hover:text-blue-700 dark:hover:border-blue-800"
                            }`}>
                            {isActive ? (
                              <ToggleRight className="h-5 w-5" />
                            ) : (
                              <ToggleLeft className="h-5 w-5" />
                            )}
                            <span>{isActive ? "Aktif" : "Nonaktif"}</span>
                          </button>
                        );
                      })()
                    ) : setting.setting_type === "JSON" ? (
                      <textarea
                        value={typeof value === "string" ? value : ""}
                        onChange={(event) =>
                          editable &&
                          handleChange(setting, event.target.value as FormValue)
                        }
                        disabled={!editable || savingId === id}
                        rows={5}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                        spellCheck={false}
                      />
                    ) : (
                      <input
                        type={
                          setting.setting_type === "Number" ? "number" : "text"
                        }
                        value={typeof value === "string" ? value : ""}
                        onChange={(event) =>
                          editable &&
                          handleChange(setting, event.target.value as FormValue)
                        }
                        disabled={!editable || savingId === id}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                      />
                    )}
                  </div>

                  {hasError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {hasError}
                    </p>
                  )}

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {editable
                        ? "Pastikan perubahan sudah sesuai sebelum menyimpan"
                        : "Pengaturan ini dikunci dan tidak dapat diedit"}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleReset(setting)}
                        disabled={!editable || !dirty || savingId === id}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                        <RefreshCcw className="h-4 w-4" />
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(setting)}
                        disabled={!editable || !dirty || savingId === id}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50">
                        {savingId === id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Simpan
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {!loading && settings.length === 0 && !error && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          Belum ada pengaturan yang dapat ditampilkan.
        </div>
      )}
    </div>
  );
}
