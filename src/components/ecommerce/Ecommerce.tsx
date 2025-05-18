import { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import UpcomingEco from "./UpcomingEco";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Ecommerce() {
  const formatLocalDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const dd = date.getDate().toString().padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const fetchTotalRevenue = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const payload = parseJwt(token);
    const staffId = payload?.userId;

    if (!staffId) return;

    const now = new Date();
    const today = formatLocalDate(now);

    const params = new URLSearchParams({
      groupType: "day",
      fromDate: today,
      toDate: today,
      staffId: staffId,
    });

    setLoadingRevenue(true);
    try {
      const res = await fetch(`/app-data-service/api/invoices/revenue/grouped?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        console.error("Error fetching revenue:", res.statusText);
        setTotalRevenue(null);
        setLoadingRevenue(false);
        return;
      }

      const data = await res.json();
      const sum = data.reduce((acc: number, item: any) => acc + (item.totalRevenue || 0), 0);

      setTotalRevenue(sum);
    } catch (error) {
      console.error("Fetch revenue error:", error);
      setTotalRevenue(null);
    } finally {
      setLoadingRevenue(false);
    }
  };

  const [bookingCount, setBookingCount] = useState<number | null>(null);
  const [complaintCount, setComplaintCount] = useState<number>(0);
  const [changeTimePaymentCount, setChangeTimePaymentCount] = useState<number | null>(null);
  const [extendBookingPaymentCount, setExtendBookingPaymentCount] = useState<number | null>(null);

  const fetchInvoiceAndRefundCount = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const now = new Date();
      const today = formatLocalDate(now);

      const params = new URLSearchParams();
      params.append("fromDate", today);
      params.append("toDate", today);

      const response = await fetch(`/app-data-service/bookings/stats/counts?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setBookingCount(data.bookings ?? 0);
    } catch (err) {
      console.error("Error fetching counts", err);
    }
  };

  const fetchChangeTimePaymentCount = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const now = new Date();
      const today = formatLocalDate(now);

      const params = new URLSearchParams();
      params.set("fromDate", today);
      params.set("toDate", today);
      params.set("searchText", "TIME_CHANGE_PAYMENT");
      const response = await fetch(`/app-data-service/api/invoices?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setChangeTimePaymentCount(data?.totalElements ?? 0);
    } catch (err) {
      console.error("Error fetching Time Change Payment count", err);
    }
  };

  const fetchExtendBookingPaymentCount = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const now = new Date();
      const today = formatLocalDate(now);

      const params = new URLSearchParams();
      params.set("fromDate", today);
      params.set("toDate", today);
      params.set("searchText", "EXTEND_BOOKING_PAYMENT");
      const response = await fetch(`/app-data-service/api/invoices?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setExtendBookingPaymentCount(data?.totalElements ?? 0);
    } catch (err) {
      console.error("Error fetching Extend Booking Payment count", err);
    }
  };

  const fetchComplaintCount = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const from = formatLocalDate(startOfYear);
      const to = formatLocalDate(now);

      const params = new URLSearchParams();
      params.append("fromDate", from);
      params.append("toDate", to);

      const response = await fetch(`/dispute/api/stats/counts?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("API error:", response.status, await response.text());
        return;
      }

      const data = await response.json();
      setComplaintCount(data?.disputes ?? 0);
    } catch (err) {
      console.error("Error fetching complaint count", err);
    }
  };

  useEffect(() => {
    fetchInvoiceAndRefundCount();
    fetchComplaintCount();
    fetchChangeTimePaymentCount();
    fetchExtendBookingPaymentCount();
    fetchTotalRevenue();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-1">
      <div className="col-span-1 rounded-2xl border border-gray-300 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap justify-between gap-6">
          {/* Extend requests */}
          <div className="flex-1 min-w-[180px] max-w-[22%] flex flex-col items-center bg-green-50 dark:bg-green-900 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
            <h2 className="text-base font-semibold text-green-800 dark:text-green-200 mb-4 tracking-wide text-center">📅 Bookings</h2>
            <h3 className="text-4xl font-extrabold text-green-700 dark:text-green-400">{bookingCount ?? "Loading..."}</h3>
            <span className="text-lg font-semibold text-green-700 dark:text-green-300 mt-1">Bookings</span>
          </div>

          {/* Change time requests */}
          <div className="flex-1 min-w-[180px] max-w-[22%] flex flex-col items-center bg-green-50 dark:bg-green-900 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
            <h2 className="text-base font-semibold text-green-800 dark:text-green-200 mb-4 tracking-wide text-center">⏰ Change time</h2>
            <h3 className="text-4xl font-extrabold text-green-700 dark:text-green-400">{changeTimePaymentCount ?? "Loading..."}</h3>
            <span className="text-lg font-semibold text-green-700 dark:text-green-300 mt-1">Requests</span>
          </div>

          {/* Extend Booking Payment */}
          <div className="flex-1 min-w-[180px] max-w-[22%] flex flex-col items-center bg-green-50 dark:bg-green-900 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
            <h2 className="text-base font-semibold text-green-800 dark:text-green-200 mb-4 tracking-wide text-center">💳 Extend Booking</h2>
            <h3 className="text-4xl font-extrabold text-green-700 dark:text-green-400">{extendBookingPaymentCount ?? "Loading..."}</h3>
            <span className="text-lg font-semibold text-green-700 dark:text-green-300 mt-1">Requests</span>
          </div>

          {/* Complaint */}
          <div className="flex-1 min-w-[180px] max-w-[22%] flex flex-col items-center bg-yellow-50 dark:bg-yellow-900 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
            <h2 className="text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-4 tracking-wide text-center">📋 Complaint</h2>
            <h3 className="text-4xl font-extrabold text-yellow-700 dark:text-yellow-400">{complaintCount ?? "Loading..."}</h3>
            <span className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 mt-1">Complaints</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 mt-6">
        <div className="flex-[0.6]">
          <UpcomingEco />
        </div>

        <div className="flex-[0.4] bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Today's Revenue</h2>

          {loadingRevenue ? (
            <p className="text-gray-500 italic">Loading...</p>
          ) : totalRevenue !== null ? (
            <p className="text-3xl font-bold text-green-600 tracking-wide">
              {totalRevenue.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </p>
          ) : (
            <p className="text-red-500">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
