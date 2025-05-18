import { useEffect, useState } from "react";
import { fetchWithAuth } from "../api/fetchWithAuth";

// Định nghĩa interface cho các tuỳ chọn truyền vào hook
interface FetchOptions<T> {
  url: string; // URL để gọi API
  filterFn?: (data: any) => T[]; // Hàm lọc dữ liệu sau khi fetch (tuỳ chọn)
  trigger?: any; // Giá trị dùng để re-fetch khi thay đổi (thường là locationId, userId, v.v.)
}

/**
 * Custom hook để fetch dữ liệu có xác thực (authenticated),
 * hỗ trợ lọc dữ liệu sau khi nhận về và tái gọi khi trigger thay đổi.
 *
 * @param {FetchOptions} options - Các tuỳ chọn fetch như URL, filterFn, trigger
 * @returns {Object} - Trạng thái dữ liệu: { data, loading, error }
 */
export function useFetchData<T = any>({ url, filterFn, trigger }: FetchOptions<T>) {
  const [data, setData] = useState<T[]>([]); // State chứa dữ liệu sau khi fetch
  const [loading, setLoading] = useState(false); // State hiển thị trạng thái đang tải
  const [error, setError] = useState<string | null>(null); // State hiển thị lỗi (nếu có)

  useEffect(() => {
    if (!url) return; // Nếu không có URL thì không fetch

    const fetchData = async () => {
      try {
        setLoading(true); // Bắt đầu loading

        // Gọi API có xác thực bằng hàm dùng chung
        const res = await fetchWithAuth(url);

        // Lấy phần content từ response (mặc định là mảng hoặc object)
        const content = res?.content || [];

        // Áp dụng hàm lọc nếu có, ngược lại dùng luôn dữ liệu gốc
        const filtered = filterFn ? filterFn(content) : content;

        // Cập nhật data
        setData(filtered);
      } catch (err) {
        console.error(err);
        setError((err as Error).message); // Cập nhật lỗi nếu có
      } finally {
        setLoading(false); // Dừng loading dù thành công hay thất bại
      }
    };

    fetchData(); // Thực thi khi URL hoặc trigger thay đổi
  }, [url, trigger]);

  return { data, loading, error };
}
