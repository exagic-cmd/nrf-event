import React, { useEffect, useState } from 'react';
import ShuttleCard from '../../components/shuttle/ShuttleCard';
import { apiRequest } from '@/lib/clientApi';
import Loading2Svg from '@/components/common/Loader2Svg';
import { Bus } from 'lucide-react';

const ShuttleList = () => {
  const [shuttles, setShuttles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShuttles = async () => {
      try {
        setLoading(true);
        // Fetching from category 2 (Transfers)
        const response = await apiRequest({
          endpoint: 'products?category_id=2',
          method: 'GET',
        });

        if (response?.data?.data?.data) {
          const allTransfers = response.data.data.data;
          // Filter for Shuttle Services (pickup_group === 1 or name contains Shuttle)
          const shuttleServices = allTransfers.filter(item => 
            item.pickup_group === 1 || 
            (item.pickup_point_group_name && item.pickup_point_group_name.toLowerCase().includes('shuttle'))
          );
          setShuttles(shuttleServices);
        }
      } catch (err) {
        console.error("Error fetching shuttles:", err);
        setError("Failed to load shuttle services.");
      } finally {
        setLoading(false);
      }
    };

    fetchShuttles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loading2Svg />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  if (shuttles.length === 0) {
    return (
      <div className="text-center py-16 mt-24 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bus className="text-gray-400" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">No Shuttles Found</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 mt-24 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
      {shuttles.map((shuttle) => (
        <ShuttleCard key={shuttle.id} shuttle={shuttle} />
      ))}
    </div>
  );
};

export default ShuttleList;