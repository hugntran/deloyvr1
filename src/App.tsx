import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ManageParkingCharging from "./pages/ManageParkingCharging";
import AddFacilityForm from "./components/ContentTop/AddFacilityForm";
import AdminComplaintPage from "./pages/AdminComplaintPage";
import VoucherManagementList from "./pages/VoucherManagementList";
import CustomerManagement from "./pages/CustomerManagement";
import ComplaintDetail from "./components/Complaint/ComplaintDetail";
import ManageTicket from "./pages/ManageTicket";
import ManageTicketList from "./pages/ManageInvoice";
import InvoiceDetail from "./components/Invoice/InvoiceDetail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VoucherDetails from "./components/Voucher/VoucherDetails";
import CreateVoucher from "./components/Voucher/CreateVoucher";
import UserDetailPage from "./components/Customer/UserDetailPage";
import ManageRefunds from "./pages/ManageRefunds";
import RefundDetailPage from "./components/Refunds/RefundDetailPage";
import ManageSlot from "./pages/ManageSlot";
import CreateStaffPage from "./components/ContentTop/CreateStaffPage";
import UserEditPage from "./components/ContentTop/UserEditPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/home" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Quản lý bãi */}
            <Route path="/manage-parking-charging" element={<ManageParkingCharging />} />
            <Route path="/add-facility-form" element={<AddFacilityForm />} />
            <Route path="/slot-list" element={<ManageSlot />} />

            {/* Quản lý hóa đơn */}
            <Route path="/invoice-list" element={<ManageTicketList />} />
            <Route path="/invoice-detail/:id" element={<InvoiceDetail />} />
            <Route path="/refund-list" element={<ManageRefunds />} />
            <Route path="/refund-list/:id" element={<RefundDetailPage />} />

            {/* Quản lý khiếu nại */}
            <Route path="/admin-complaint-page" element={<AdminComplaintPage />} />
            <Route path="/complaint/:id" element={<ComplaintDetail />} />

            {/* Quản lý voucher */}
            <Route path="/voucher-management-list" element={<VoucherManagementList />} />
            <Route path="/add-voucher" element={<CreateVoucher />} />
            <Route path="/vouchers/:id" element={<VoucherDetails />} />

            {/* Quản lý user */}
            <Route path="/customer-management" element={<CustomerManagement />} />
            <Route path="/user-details/:userId" element={<UserDetailPage />} />
            <Route path="/create-user" element={<CreateStaffPage />} />
            <Route path="/user-details/:userId/edit" element={<UserEditPage />} />

            {/* Ticket */}
            <Route path="/ticket-management" element={<ManageTicket />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* ✅ Toast container */}
        <ToastContainer position="bottom-center" autoClose={1000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </Router>
    </>
  );
}
