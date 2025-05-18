import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Paper } from "@mui/material";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface Slot {
  id: string;
  slotNumber: string;
  zone?: string;
  gate?: string;
  [key: string]: any;
}

interface SlotSelectorModalProps {
  open: boolean;
  onClose: () => void;
  slots: Slot[];
  serviceType: "PARKING" | "CHARGING";
  conflictedTicketId: string | null;
  conflictedGate?: string | null; // Conflicted gate của vé con
  onReassignSuccess: () => void; // Callback để xử lý khi reassign thành công
}

export default function SlotSelectorModal({ open, onClose, slots, serviceType, conflictedTicketId, conflictedGate, onReassignSuccess }: SlotSelectorModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null); // Slot đã chọn
  console.log("Conflicted Gate: ", conflictedGate);

  // Gom slot theo zone hoặc gate, tùy vào serviceType
  const slotsByCategory = slots.reduce((acc: Record<string, Slot[]>, slot) => {
    const category = serviceType === "PARKING" ? slot.zone || "UNKNOWN" : slot.gate || "UNKNOWN";
    if (!acc[category]) acc[category] = [];
    acc[category].push(slot);
    return acc;
  }, {});

  const handleSelectSlot = (slot: Slot) => {
    // Cập nhật lại state khi chọn slot
    setSelectedSlot((prevSlot) => (prevSlot?.id === slot.id ? null : slot)); // Toggle chọn và bỏ chọn slot
  };

  const handleConfirmSelection = async () => {
    if (!selectedSlot || !conflictedTicketId) return;

    const token = localStorage.getItem("authToken");
    const url = `/app-data-service/tickets/reassign-slot?conflictedTicketId=${conflictedTicketId}&newSlotId=${selectedSlot.id}`;

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Failed to reassign slot: ${response.status}`);

      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: "Success!",
        text: "Slot reassigned successfully.",
        icon: "success",
      });
      onReassignSuccess(); // Gọi callback để refetch dữ liệu
      onClose(); // Đóng modal sau khi reassigned thành công
    } catch (err) {
      console.error("Failed to reassign slot:", err);
      alert("Reassign slot failed.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Available Slots</DialogTitle>
      <DialogContent dividers>
        {Object.entries(slotsByCategory).map(([category, categorySlots]) => (
          <Box key={category} mb={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {serviceType === "PARKING" ? `ZONE ${category}` : `GATE ${category}`}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {categorySlots.map((slot) => {
                const isDisabled = serviceType === "CHARGING" && conflictedGate && slot.gate !== conflictedGate;
                return (
                  <Paper
                    key={slot.id}
                    elevation={2}
                    sx={{
                      width: 60,
                      height: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: isDisabled ? "not-allowed" : "pointer", // Chỉ cho phép chọn nếu không bị disable
                      backgroundColor: selectedSlot?.id === slot.id ? "#d0f0ff" : "#f5f5f5", // Nổi bật slot đã chọn
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: isDisabled ? "#f5f5f5" : "#d0f0ff", // Không thay đổi màu khi hover nếu bị disable
                      },
                    }}
                    onClick={() => !isDisabled && handleSelectSlot(slot)} // Không cho phép chọn nếu slot bị disable
                  >
                    {slot.slotNumber}
                  </Paper>
                );
              })}
            </Box>
          </Box>
        ))}

        {slots.length === 0 && <Typography color="textSecondary">No available slots.</Typography>}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleConfirmSelection}
          disabled={!selectedSlot}
          variant="contained"
          sx={{
            backgroundColor: "#007BFF", // xanh nước biển
            color: "white",
            "&:hover": {
              backgroundColor: "#0069d9", // xanh nước biển đậm hơn khi hover
            },
            marginRight: 1,
          }}
        >
          Confirm
        </Button>

        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: "#d33", // đỏ
            color: "white",
            "&:hover": {
              backgroundColor: "#b22", // đỏ đậm hơn khi hover
            },
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
