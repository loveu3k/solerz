import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import './index.css';

const HomePage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('listings').select('*');
      if (error) {
        console.error('Error fetching listings:', error);
        setError(error.message);
      } else {
        console.log('Fetched listings:', data); // Debugging log
        setListings(data);
      }
      setLoading(false);
    };

    fetchListings();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{listing.title}</h2>
            <p>{listing.description}</p>
            <p className="text-gray-500">{listing.location}</p>
            <p className="text-gray-500">${listing.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
