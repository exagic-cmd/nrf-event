import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FlightTracker({
  pickupId,
  flightNumber,
  trigger,
  onTrackSuccess,
  onTrackFail,
}) {
  const [flightData, setFlightData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);
  const [infoMessage, setInfoMessage] = useState(""); 

  useEffect(() => {
    if (!trigger) return;

    const flightNumberTrimmed = (flightNumber || "").trim();
    if (!flightNumberTrimmed || !pickupId) {
      const msg = "Please enter a valid flight number.";
      setError(msg);
      setFlightData(null);
      onTrackFail?.(msg);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");
      setInfoMessage(""); 
      setFlightData(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-flight-data?flight_number=${encodeURIComponent(
            flightNumberTrimmed
          )}&pickup_id=${encodeURIComponent(pickupId)}`
        );

        const result = await res.json();
        if (cancelled) return;

        if (res.ok && result && !result.error) {
          const original_schedule_time = result?.schedule_time || null;
         
          let schedule =
            result?.schedule_time ||
            null;

          // Apply time adjustment
          if (schedule && result?.type) {
            const [h, m, s] = schedule.split(":").map(Number);
            let date = new Date();
            date.setHours(h, m, s || 0);

            if (result.type === "TA") {
              date.setHours(date.getHours() + 1);
            } else if (result.type === "TD") {
              date.setHours(date.getHours() - 3);
            }

            const hh = String(date.getHours()).padStart(2, "0");
            const mm = String(date.getMinutes()).padStart(2, "0");
            const ss = String(date.getSeconds()).padStart(2, "0");
            schedule = `${hh}:${mm}:${ss}`;
          }

          setFlightData({ ...result, schedule_time: schedule, original_schedule_time: original_schedule_time });
          setIsDetailsVisible(true);

          onTrackSuccess?.({
            ...result,
            schedule_time: schedule,
            scheduled_time: schedule,
            scheduledTime: schedule,
            original_schedule_time: original_schedule_time,
          });
        } else {
        //  const msg = "We couldn’t find the flight details in our Database, we will check it manually";
          setError(msg);
          setFlightData(null);
          onTrackFail?.(msg);
        }
      } catch (err) {
        if (cancelled) return;
       // const msg = "We couldn’t find the flight details in our Database, we will check it manually";
        setError(msg);
        onTrackFail?.(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [trigger]);

  const toggleDetails = () => setIsDetailsVisible(!isDetailsVisible);
  if (loading)
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
        <svg
          className="animate-spin h-4 w-4 text-[#D3202D]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span>Tracking your flight...</span>
      </div>
    );


  if (error) return <p className="text-[#D3202D] text-sm mt-3">{error}</p>;

  if (infoMessage)
    return (
      <div className="mt-3 text-gray-700 text-sm bg-orange-50 border border-orange-100 rounded-lg p-3">
        {infoMessage}
      </div>
    );

  if (!flightData) return null;

  const isDeparture = flightData.type === "TD";

  const details = isDeparture
    ? [
        ["Departing To", flightData.departing_for],
        ["Gate", flightData.gate],
        ["Terminal", flightData.terminal],
         ["Flight Time", flightData.original_schedule_time],
        [
          "Estimated Pickup Time",
          flightData.schedule_time || "To be updated after payment confirmation"
        ],
      ]
    : [
        ["Arriving From", flightData.arriving_from],
        ["Terminal", flightData.terminal],
        ["Belt", flightData.belt],
        ["Flight Time", flightData.original_schedule_time],
          ["Estimated Pickup Time", flightData?.schedule_time]
      ];

  const airlineLogo = `https://logo.clearbit.com/${encodeURIComponent(
    (flightData.airline || "airline").replace(/\s+/g, "") + ".com"
  )}`;

  return (
    <div className="mt-1 border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
      <button
        onClick={toggleDetails}
        className="w-full flex justify-between items-center bg-red-50 px-4 py-2 font-semibold text-[#D3202D] border-b border-orange-100"
      >
        <span>Flight Details</span>
        {isDetailsVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isDetailsVisible ? "max-h-screen" : "max-h-0"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            {airlineLogo && (
              <img
                src={airlineLogo}
                alt={flightData.airline}
                className="w-10 h-10 object-contain rounded-md border"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
            <div>
              <div className="font-semibold text-gray-800">
                {flightData.airline || "Unknown Airline"}
              </div>
              <div className="text-sm text-gray-600">{flightData.flight_number}</div>
            </div>
          </div>
        </div>

        <table className="w-full text-xs md:text-sm text-gray-700">
          <tbody>
            {details.map(([key, val]) => (
              <tr key={key} className="border-b last:border-none">
                <td className="px-4 py-2 font-medium bg-gray-50 w-1/3">{key}</td>
                <td className="px-4 py-2 text-end text-gray-700">{val || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-[10px] text-gray-500 px-4 py-2 border-t bg-gray-50">
          Disclaimer: <span>Flight number, time, or terminal mismatches are common and not a concern. our drivers monitor flights in real time and adjust pickup timing and terminal accordingly.</span>
        </p>
      </div>
    </div>
  );
}
