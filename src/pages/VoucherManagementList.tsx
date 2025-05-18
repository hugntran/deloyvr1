import React, { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import FloatingAddButton from "../components/SomeButton/FloatingAddButton";
import VoucherList from "../components/Voucher/VoucherList";

export default function VoucherManagementList() {
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "ADMIN";
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
  };

  return (
    <>
      <PageMeta title="Voucher" description="" />
      <PageBreadcrumb pageTitle="Voucher" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 lg:p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-4 bg-gray-50 p-3 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="🔍 Search by code or title..." className="px-4 py-2 border rounded-lg" />
              <select value={statusFilter} onChange={handleStatusChange} className="px-4 py-2 border rounded-lg text-sm">
                <option value="ALL">Filter by status: All</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="UP_COMING">Up Coming</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            {isAdmin && <FloatingAddButton to="/add-voucher" />}
          </div>

          <div className="rounded-lg shadow-md bg-gray-50">
            <VoucherList searchTerm={searchTerm} statusFilter={statusFilter} />
          </div>
        </div>
      </div>
    </>
  );
}
