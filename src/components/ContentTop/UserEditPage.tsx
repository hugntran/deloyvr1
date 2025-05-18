import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO } from "date-fns";
import Swal from "sweetalert2";

interface User {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  dob: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  roleNames: string[];
}

function formatDateForInput(dob: string | null): string {
  if (!dob) return "";
  const date = new Date(dob);
  if (isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const UserEditPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const user = (location.state as { user: User }).user;
  const [uploading, setUploading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    username: user.username,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email,
    phone: user.phone ?? "",
    dob: formatDateForInput(user.dob),
    avatarUrl: user.avatarUrl ?? "",
    newPassword: "",
    roleNames: user.roleNames ?? [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (checked) {
        setFormData((prev) => ({ ...prev, roleNames: [value] }));
      } else {
        setFormData((prev) => ({ ...prev, roleNames: [] }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken");

    const payload = {
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob || null,
      avatarUrl: formData.avatarUrl || null,
      newPassword: formData.newPassword || null,
      roleNames: formData.roleNames,
    };

    console.log("Payload gửi lên:", payload);

    try {
      const response = await fetch(`/identity/users/admin/update-user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Update user successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(`/user-details/${userId}`);
      } else {
        const errData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to update user: " + (errData.message || response.statusText),
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: (error as Error).message,
      });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("authToken");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "No authentication token found. Please log in again.",
      });
      return;
    }
    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("files", file);

      const res = await fetch("/file/aws/upload-images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await res.json();
      const uploadedUrl = data[0];

      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, avatarUrl: uploadedUrl }));
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "Image uploaded but no URL returned.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Upload Error",
        text: (error as Error).message,
      });
    } finally {
      setUploading(false);
    }
  };

  const availableRoles = ["STAFF", "USER"];

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Edit User</h1>

      <div className="space-y-4">
        <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" className="w-full p-2 border rounded" />
        <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="w-full p-2 border rounded" />
        <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="w-full p-2 border rounded" />
        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" className="w-full p-2 border rounded" />
        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 border rounded" />
        <DatePicker
          selected={formData.dob ? parseISO(formData.dob) : null}
          onChange={(date: Date | null) => {
            setFormData((prev) => ({
              ...prev,
              dob: date ? date.toISOString().split("T")[0] : "",
            }));
          }}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select Date of Birth"
          className="w-full p-2 border rounded"
        />
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Avatar Image</label>
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
          {formData.avatarUrl && (
            <>
              <img src={formData.avatarUrl} alt="Avatar preview" className="mt-2 w-24 h-24 object-cover rounded-full border" />
              <p className="mt-1 text-sm text-blue-600 break-all">{formData.avatarUrl}</p>
            </>
          )}
        </div>
        <input
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="New Password (leave blank to keep)"
          type="password"
          className="w-full p-2 border rounded"
          autoComplete="new-password"
        />
        {/* Roles checkbox */}
        <div>
          <p className="mb-2 font-semibold">Roles</p>
          <div className="flex space-x-4">
            {availableRoles.map((role) => (
              <label key={role} className="inline-flex items-center space-x-2">
                <input type="checkbox" name="roleNames" value={role} checked={formData.roleNames.includes(role)} onChange={handleChange} className="form-checkbox" />
                <span>{role}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex space-x-4 mt-4">
          <button onClick={handleSubmit} disabled={uploading} className={`px-4 py-2 rounded text-white ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-800"}`}>
            {uploading ? "Uploading..." : "Save"}
          </button>

          <button onClick={() => navigate(`/user-details/${userId}`)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800">
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserEditPage;
