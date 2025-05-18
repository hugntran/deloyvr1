import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../../api/fetchWithAuth";

type TicketData = {
  ticket: {
    id: string;
    startDateTime: string;
  };
  locationName: string;
  slotNumber: string;
  zoneGate: string;
};

const UpcomingEco: React.FC = () => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetchWithAuth<{ content: TicketData[] }>("/app-data-service/tickets/pageable/find?page=0&size=100&sort=createdAt,DESC");
        setTickets(res.content.slice(0, 5));
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <p>Loading recent tickets...</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">🎟️ Upcoming Tickets</h2>
      <table className="w-full text-sm text-left border">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2">Ticket ID</th>
            <th className="px-4 py-2">Location</th>
            <th className="px-4 py-2">Slot</th>
            <th className="px-4 py-2">Start Time</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.ticket.id} className="border-t">
              <td className="px-4 py-2">{t.ticket.id.slice(0, 8).toUpperCase()}</td>
              <td className="px-4 py-2">{t.locationName}</td>
              <td className="px-4 py-2">
                {t.slotNumber} - {t.zoneGate}
              </td>
              <td className="px-4 py-2">{new Date(t.ticket.startDateTime).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UpcomingEco;
