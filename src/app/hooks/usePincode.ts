import { useState, useCallback } from 'react';

interface PincodeResult {
    pincode: string | null;
    address: string | null;
    loading: boolean;
    error: string | null;
    fetchPincode: (lat: number, lon: number) => Promise<void>;
}

export const usePincode = (): PincodeResult => {
    const [pincode, setPincode] = useState<string | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPincode = useCallback(async (lat: number, lon: number) => {
        setLoading(true);
        setError(null);
        try {
            // Using OpenStreetMap Nominatim API (Free, no key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
                {
                    headers: {
                        'User-Agent': 'FirebaseApp/1.0', // Required by OSM policy
                    },
                }
            );
            const data = await response.json();

            if (data.address) {
                if (data.address.postcode) {
                    setPincode(data.address.postcode);
                } else {
                    setPincode(null);
                }

                // Construct a nice looking address
                const addr = [
                    data.address.road,
                    data.address.suburb,
                    data.address.city || data.address.town || data.address.village,
                    data.address.state
                ].filter(Boolean).join(', ');
                setAddress(addr);
            } else {
                setPincode(null);
                setAddress(null);
            }
        } catch (err) {
            console.warn("Error fetching pincode:", err);
            setError("Failed to fetch address details");
        } finally {
            setLoading(false);
        }
    }, []);

    return { pincode, address, loading, error, fetchPincode };
};
