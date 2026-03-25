import { useQuery } from '@tanstack/react-query';

interface PincodeData {
    pincode: string | null;
    address: string | null;
}

export const usePincode = (lat?: number, lon?: number) => {
    return useQuery<PincodeData>({
        queryKey: ['pincode', lat, lon],
        queryFn: async () => {
            if (!lat || !lon) return { pincode: null, address: null };

            console.log(`[usePincode] Fetching details for ${lat}, ${lon}`);
            
            // Using OpenStreetMap Nominatim API
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
                {
                    headers: {
                        'User-Agent': 'FirebaseApp/1.0',
                    },
                }
            );
            const data = await response.json();

            if (data.address) {
                const pincode = data.address.postcode || null;
                const address = [
                    data.address.road,
                    data.address.suburb,
                    data.address.city || data.address.town || data.address.village,
                    data.address.state
                ].filter(Boolean).join(', ');

                return { pincode, address };
            }

            return { pincode: null, address: null };
        },
        enabled: !!lat && !!lon,
        staleTime: 1000 * 60 * 60, // 1 hour (addresses don't change often)
    });
};
