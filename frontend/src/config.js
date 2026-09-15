const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:7000";

export const config = {
  loadImagesUrl: `${API_BASE}/LoadImages`,
  iqamahsUrl: `${API_BASE}/Iqamahs`,

  city: import.meta.env.VITE_CITY || "Chicago",
  country: import.meta.env.VITE_COUNTRY || "US",
  method: 2,
  school: 1,

  slideshowIntervalMs: Number(import.meta.env.VITE_SLIDESHOW_INTERVAL_MS) || 15000,
  khutbahDurationMs: Number(import.meta.env.VITE_KHUTBAH_DURATION_MS) || 45 * 60 * 1000,
  webcamDeviceId: import.meta.env.VITE_WEBCAM_DEVICE_ID || null,
};
