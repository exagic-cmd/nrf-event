import { useState } from "react";
import { useProductStore } from "@/store/useProductStore";
import PolicyModal from "../ProductInfo/PolicyContent"; // ✅ Your updated modal component

const BookingPolicy = ({ onTermsChange, termsAccepted , error,id}) => {
  const acceptPolicy = useProductStore((state) => state.acceptPolicy);
  

  const [showModal, setShowModal] = useState(false);
  const [policyContent, setPolicyContent] = useState("");



  const handleLinkClick = async (e) => {
    e.preventDefault();
    try {
      const res = await acceptPolicy(id);
      const content = res?.data?.termconditions?.description || "Policy not available."; // Adjust according to API response structure
      setPolicyContent(content);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to load booking policy", err);
      setPolicyContent("Failed to load policy. Please try again later.");
      setShowModal(true);
    }
  };

  const closeModal = () => setShowModal(false);

  return (
    <div className="text-sm text-muted-foreground mt-6 mx-2 md:mx-8 ">
      <p>100% Cancellation Charges Apply</p>
      <label className="inline-flex items-center mt-2">
        <input
          type="checkbox"
          className="form-checkbox text-[#CC9A55]"
          checked={termsAccepted}
        onChange={onTermsChange}
        />
        <span className="ml-2">
          I Understand and accept the{" "}
          <a href="#" className="text-[#CC9A55] underline" onClick={handleLinkClick}>
            Cancellation Policy Tour 1A
          </a>
        </span>
</label>
      {error && (
        <div className="text-sm text-destructive mt-1">{error}</div>
      )}
      {/* ✅ Show Modal when clicked */}
      {showModal && <PolicyModal onClose={closeModal} content={policyContent} />}
    </div>
  );
};

export default BookingPolicy;
