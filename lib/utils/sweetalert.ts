// lib/utils/sweetalert.ts
import Swal from "sweetalert2";

// Fungsi untuk cek dark mode
const isDarkMode = () => {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
};

// Custom SweetAlert2 dengan dark theme
export const CustomSwal = Swal.mixin({
  customClass: {
    popup: "dark:bg-gray-800 dark:border dark:border-gray-700",
    title: "dark:text-gray-100",
    htmlContainer: "dark:text-gray-300",
    confirmButton: "!bg-blue-600 hover:!bg-blue-700",
    cancelButton: "!bg-gray-600 hover:!bg-gray-700",
    denyButton: "!bg-red-600 hover:!bg-red-700",
  },
  buttonsStyling: false,
  didOpen: () => {
    // Apply custom button styles
    const confirmBtn = document.querySelector(".swal2-confirm") as HTMLElement;
    const cancelBtn = document.querySelector(".swal2-cancel") as HTMLElement;
    const denyBtn = document.querySelector(".swal2-deny") as HTMLElement;

    if (confirmBtn) {
      confirmBtn.className +=
        " px-6 py-3 rounded-lg font-medium text-white transition";
    }
    if (cancelBtn) {
      cancelBtn.className +=
        " px-6 py-3 rounded-lg font-medium text-white transition";
    }
    if (denyBtn) {
      denyBtn.className +=
        " px-6 py-3 rounded-lg font-medium text-white transition";
    }
  },
});

// Helper functions dengan dark theme support

export const showSuccess = (
  title: string,
  message?: string,
  timer?: number
) => {
  return CustomSwal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonText: "OK",
    timer,
    timerProgressBar: !!timer,
  });
};

export const showError = (title: string, message?: string) => {
  return CustomSwal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonText: "OK",
  });
};

export const showWarning = (title: string, message?: string) => {
  return CustomSwal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonText: "OK",
  });
};

export const showInfo = (title: string, message?: string) => {
  return CustomSwal.fire({
    icon: "info",
    title,
    text: message,
    confirmButtonText: "OK",
  });
};

export const showConfirm = async (
  title: string,
  message: string,
  confirmText: string = "Ya, Lanjutkan",
  cancelText: string = "Batal"
) => {
  const result = await CustomSwal.fire({
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });

  return result.isConfirmed;
};

export const showDeleteConfirm = async (itemName: string) => {
  return showConfirm(
    "Konfirmasi Hapus",
    `Yakin ingin menghapus ${itemName}?`,
    "Ya, Hapus",
    "Batal"
  );
};

export const showLoading = (title: string = "Memproses...", text?: string) => {
  CustomSwal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      CustomSwal.showLoading();
    },
  });
};

export const closeLoading = () => {
  CustomSwal.close();
};

// Toast notification dengan dark theme
export const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: "dark:bg-gray-800 dark:border dark:border-gray-700",
    title: "dark:text-gray-100",
  },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export const showToast = (
  icon: "success" | "error" | "warning" | "info",
  title: string
) => {
  return Toast.fire({
    icon,
    title,
  });
};
