import { toast } from "react-toastify";
import { useState } from "react";

// Tạo kiểu dữ liệu ActionHook để linh hoạt
interface ActionHook {
  url: string; // URL của API cần gọi
  successMessage: string; // Thông báo thành công
  errorMessage: string; // Thông báo lỗi
}

/**
 * Custom hook xử lý hành động (checkin, checkout, v.v.)
 * @param {ActionHook} params - Các tham số như URL, thông báo thành công và lỗi
 * @returns {Object} - Trạng thái dữ liệu: { handleAction, loadingIndex }
 */

export function useAction({ url, successMessage, errorMessage }: ActionHook) {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const handleAction = async (requestId: string, index: number, onSuccess?: () => void) => {
    try {
      setLoadingIndex(index);

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token 404");

      const response = await fetch(url.replace(":id", requestId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Bug from server: ${text}`);
      }

      toast.success(successMessage);
      onSuccess?.();
    } catch (err) {
      console.error(errorMessage, err);
      toast.error(errorMessage);
    } finally {
      setLoadingIndex(null);
    }
  };

  return { handleAction, loadingIndex };
}
