import { useState } from "react";
import { TextField, Button, Box, Typography, FormControlLabel, Checkbox, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LeafletMouseEvent } from "leaflet";
import axios from "axios";

// Fix marker icon not showing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const MapClickHandler = ({ setCoordinates, setAddress }: { setCoordinates: React.Dispatch<React.SetStateAction<[number, number]>>; setAddress: React.Dispatch<React.SetStateAction<string>> }) => {
  useMapEvents({
    click: async (e: LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setCoordinates([lat, lng]);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        setAddress(data.display_name || "");
      } catch (error) {
        toast.error("Failed to fetch address from map click");
      }
    },
  });
  return null;
};

const AddFacilityForm = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [totalParkingSlots, setTotalParkingSlots] = useState(0);
  const [coordinates, setCoordinates] = useState<[number, number]>([21.028658, 105.781899]);
  const [services, setServices] = useState<string[]>([]);
  const [chargingGateDistribution, setChargingGateDistribution] = useState({
    "11W": 0,
    "22W": 0,
    "50W": 0,
    "100W": 0,
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleService = (service: string) => {
    setServices((prev) => (prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Missing token!");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const response = await axios.post("/file/aws/upload-images", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      // Kiểm tra dữ liệu phản hồi
      console.log("API Response:", response.data);

      // Kiểm tra xem dữ liệu trả về có phải là một mảng và có chứa URL hợp lệ
      const urls = Array.isArray(response.data) ? response.data.filter((item: any) => item).map((item: any) => item) : [];
      if (!urls.length) throw new Error("No valid image URLs returned");

      // Gán URL vào state
      setImages((prev) => [...prev, ...urls]);

      toast.success("Images uploaded successfully!");
    } catch (error) {
      const err = error as Error;
      toast.error("Upload failed: " + err.message);
    }
  };

  const validateForm = () => {
    if (!name.trim() || !address.trim()) {
      toast.error("Name and address are required");
      return false;
    }
    if (services.includes("PARKING") && totalParkingSlots <= 0) {
      toast.error("Total parking slots must be greater than 0");
      return false;
    }

    // Validate Charging Gate distribution
    if (services.includes("CHARGING")) {
      const totalChargingSlots = Object.values(chargingGateDistribution).reduce((acc, value) => acc + value, 0);
      if (totalChargingSlots <= 0) {
        toast.error("Total charging slots must be greater than 0");
        return false;
      }
    }

    return true;
  };

  const submitConfirmed = async () => {
    setOpenConfirm(false);
    if (!validateForm()) return;
    setLoading(true);

    const locationData = {
      name,
      address,
      images,
      coordinates: [coordinates[1], coordinates[0]],
      locationStatus: "VALID",
      services,
      ...(services.includes("PARKING") && { totalParkingSlots }),
      ...(services.includes("CHARGING") && { chargingGateDistribution }),
    };

    console.log("Payload being sent to the server:", JSON.stringify(locationData));

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Missing token!");
        setLoading(false);
        return;
      }

      const response = await fetch("/app-data-service/locations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) throw new Error("Failed to create location");

      toast.success("Location created successfully!");
    } catch (error) {
      toast.error("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Create New Location
      </Typography>

      {/* Section: Basic Info */}
      <Typography variant="h6" mt={3}>
        Basic Information
      </Typography>
      <TextField label="Location Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} margin="normal" required />
      <TextField label="Address" fullWidth value={address} onChange={(e) => setAddress(e.target.value)} margin="normal" required />

      {/* Section: Coordinates */}
      <Typography variant="h6" mt={3}>
        Coordinates
      </Typography>
      <TextField label="Latitude" type="number" fullWidth value={coordinates[0]} onChange={(e) => setCoordinates([Number(e.target.value), coordinates[1]])} margin="normal" />
      <TextField label="Longitude" type="number" fullWidth value={coordinates[1]} onChange={(e) => setCoordinates([coordinates[0], Number(e.target.value)])} margin="normal" />

      {/* Map Picker */}
      <Typography variant="h6" mt={3}>
        Select Location
      </Typography>
      <Box height={400} mb={2}>
        <MapContainer center={coordinates} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler setCoordinates={setCoordinates} setAddress={setAddress} />
          <Marker position={[coordinates[1], coordinates[0]]} />
        </MapContainer>
      </Box>

      {/* Section: Images */}
      <Typography variant="h6" mt={3}>
        Upload Images
      </Typography>
      <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
      <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
        {images.map((url, index) => (
          <Box key={index} width={100} height={100}>
            <img src={url} alt={`Uploaded ${index}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
          </Box>
        ))}
      </Box>

      {/* Section: Services */}
      <Typography variant="h6" mt={3}>
        Service provided
      </Typography>
      <FormControlLabel control={<Checkbox checked={services.includes("PARKING")} onChange={() => toggleService("PARKING")} />} label="Parking" />
      <FormControlLabel control={<Checkbox checked={services.includes("CHARGING")} onChange={() => toggleService("CHARGING")} />} label="Charging" />

      {/* Parking */}
      {services.includes("PARKING") && (
        <TextField label="Total Parking Slots" type="number" fullWidth value={totalParkingSlots} onChange={(e) => setTotalParkingSlots(Number(e.target.value))} margin="normal" />
      )}

      {/* Charging */}
      {services.includes("CHARGING") && (
        <>
          <Typography variant="h6" mt={3}>
            Charging Gate Distribution
          </Typography>
          {["11W", "22W", "50W", "100W"].map((watt) => (
            <TextField
              key={watt}
              label={watt}
              type="number"
              fullWidth
              value={chargingGateDistribution[watt as keyof typeof chargingGateDistribution]}
              onChange={(e) =>
                setChargingGateDistribution({
                  ...chargingGateDistribution,
                  [watt]: Number(e.target.value),
                })
              }
              margin="normal"
            />
          ))}
        </>
      )}

      {/* Submit */}
      <Box display="flex" justifyContent="right" mt={3}>
        <Button variant="contained" onClick={() => setOpenConfirm(true)} disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : null}>
          {loading ? "Submitting..." : "Create Location"}
        </Button>
        <Button
          variant="contained"
          onClick={() => window.history.back()}
          disabled={loading}
          sx={{
            marginLeft: "10px",
            backgroundColor: "#d33", // Đặt màu nền
            color: "white", // Đặt màu chữ thành trắng
            "&:hover": {
              backgroundColor: "#c12", // Đổi màu nền khi hover
            },
          }}
        >
          Back
        </Button>
      </Box>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm Location Creation</DialogTitle>
        <DialogContent>Are you sure you want to create this new location?</DialogContent>
        <DialogActions>
          <Button onClick={submitConfirmed} autoFocus variant="contained">
            Confirm
          </Button>
          <Button onClick={() => setOpenConfirm(false)} sx={{ backgroundColor: "#d33", color: "white", "&:hover": { backgroundColor: "#a00" } }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddFacilityForm;
