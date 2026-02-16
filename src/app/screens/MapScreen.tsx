import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Platform, PermissionsAndroid, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePincode } from '../hooks/usePincode';
import PincodeDisplay from '../components/PincodeDisplay';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const MapScreen = () => {
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    // initialLocation is stable and used ONLY for the first render of the HTML
    const [initialLocation, setInitialLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const webViewRef = useRef<WebView>(null);

    // Use custom hook for pincode logic
    const { pincode, address, loading: pincodeLoading, fetchPincode } = usePincode();

    const checkLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'App needs access to your location to show it on the map.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setHasLocationPermission(true);
                    getInitialLocation();
                } else {
                    console.log('Location permission denied');
                    setLoading(false);
                }
            } catch (err) {
                console.warn(err);
                setLoading(false);
            }
        } else {
            setHasLocationPermission(true);
            getInitialLocation();
        }
    };

    const getInitialLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setInitialLocation({ latitude, longitude });
                // Fetch pincode using the hook
                fetchPincode(latitude, longitude);
                setLoading(false);
            },
            (error) => {
                console.log(error.code, error.message);
                setLoading(false); // Load map anyway with default
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
        );
    };

    const handleRecenter = () => {
        // Show immediate feedback if desired, or just call the function
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // We do NOT update initialLocation here, preventing reload

                // Fetch new pincode using the hook
                fetchPincode(latitude, longitude);

                if (webViewRef.current) {
                    const script = `
                        if (typeof map !== 'undefined') {
                            map.flyTo([${latitude}, ${longitude}], 15, { animate: true });
                            if (typeof userMarker !== 'undefined') {
                                userMarker.setLatLng([${latitude}, ${longitude}]);
                            } else {
                                userMarker = L.marker([${latitude}, ${longitude}]).addTo(map)
                                    .bindPopup("You are here").openPopup();
                                L.circle([${latitude}, ${longitude}], {radius: 50}).addTo(map);
                            }
                        }
                    `;
                    webViewRef.current.injectJavaScript(script);
                }
            },
            (error) => {
                console.log("Recenter error:", error.message);
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
        );
    };

    useEffect(() => {
        checkLocationPermission();
    }, []);

    const mapHTML = useMemo(() => {
        const lat = initialLocation ? initialLocation.latitude : 51.505;
        const lng = initialLocation ? initialLocation.longitude : -0.09;

        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
            <style>
              body { margin: 0; padding: 0; background-color: #f2efe9; }
              html, body, #map { height: 100%; width: 100%; overflow: hidden; }
              /* Force zoom controls to be visible and larger */
              .leaflet-control-zoom {
                  display: block !important;
                  border: 2px solid rgba(0,0,0,0.2) !important;
              }
              .leaflet-touch .leaflet-control-zoom-in, .leaflet-touch .leaflet-control-zoom-out {
                  width: 40px !important;
                  height: 40px !important;
                  line-height: 40px !important;
                  font-size: 22px !important;
              }
            </style>
          </head>
          <body>
            <div id="map"></div>
            <script>
              var map = L.map('map', {
                zoomControl: true,
                zoomAnimation: true,
                fadeAnimation: true,
                markerZoomAnimation: true
              }).setView([${lat}, ${lng}], 15);
              
              // Move zoom control to bottom left so it doesn't conflict with other UI
              map.zoomControl.setPosition('topleft');

              L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                keepBuffer: 18, // Preload much more surrounding area to avoid blank space on swipe 
                updateWhenZooming: false, 
                updateInterval: 20 // Update more frequently during interaction
              }).addTo(map);

              var userMarker;
              ${initialLocation ? `
                userMarker = L.marker([${lat}, ${lng}]).addTo(map)
                  .bindPopup("You are here").openPopup();
                L.circle([${lat}, ${lng}], {radius: 50}).addTo(map);
              ` : ''}
            </script>
          </body>
          </html>
        `;
    }, [initialLocation]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10 }}>Getting your location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Location</Text>
            </View>

            <PincodeDisplay
                pincode={pincode}
                address={address}
                loading={pincodeLoading} // Pass loading state to component
            />

            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: mapHTML }}
                style={[styles.map, { backgroundColor: '#f2efe9' }]} // Match map color
                containerStyle={{ backgroundColor: '#f2efe9' }}
            />

            <TouchableOpacity
                style={styles.recenterButton}
                onPress={handleRecenter}
                activeOpacity={0.8}
            >
                <Ionicons name="locate" size={28} color="#007AFF" />
            </TouchableOpacity>

            {!hasLocationPermission && (
                <View style={styles.bottomWarning}>
                    <Text style={styles.warningText}>Location permission is needed.</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: 60,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    map: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recenterButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#fff',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    bottomWarning: {
        position: 'absolute',
        bottom: 80,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 8,
    },
    warningText: {
        color: '#fff',
    },
});

export default MapScreen;
