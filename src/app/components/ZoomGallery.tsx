import React, { useState, useEffect } from "react";
import {
    View,
    Image,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    Dimensions,
    StyleSheet,
} from "react-native";

import PagerView from "react-native-pager-view";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function ZoomGallery({ images = [] }) {
    const [visible, setVisible] = useState(false);
    const [index, setIndex] = useState(0);
    const [{ width: viewWidth, height: viewHeight }, setViewDimensions] = useState({ width, height });

    const openViewer = (i: number) => {
        setIndex(i);
        setVisible(true);
    };

    return (
        <View style={styles.container}>
            {/* Inline Slider */}
            <View style={styles.sliderContainer}>
                <PagerView
                    style={styles.pager}
                    initialPage={0}
                    onPageSelected={(e) => setIndex(e.nativeEvent.position)}
                >
                    {images.map((img, i) => (
                        <TouchableOpacity
                            key={i}
                            activeOpacity={0.9}
                            onPress={() => openViewer(i)}
                            style={styles.slide}
                        >
                            <Image source={{ uri: img }} style={styles.inlineImage} resizeMode="cover" />
                        </TouchableOpacity>
                    ))}
                </PagerView>

                {/* Badge */}
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                        {index + 1} / {images.length}
                    </Text>
                </View>
            </View>

            {/* Fullscreen Viewer */}
            <Modal visible={visible} transparent >
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <View
                        style={styles.modal}
                        onLayout={(e) => {
                            const { width: w, height: h } = e.nativeEvent.layout;
                            // Only update if dimensions differ significantly to avoid loops
                            if (Math.abs(viewWidth - w) > 1 || Math.abs(viewHeight - h) > 1) {
                                setViewDimensions({ width: w, height: h });
                            }
                        }}
                    >
                        <PagerView
                            style={{ flex: 1 }}
                            initialPage={index}
                            onPageSelected={(e) => setIndex(e.nativeEvent.position)}
                        >
                            {
                                images.map((img, i) => (
                                    <ZoomableImage
                                        key={i}
                                        uri={img}
                                        index={i}
                                        activeIndex={index}
                                        containerWidth={viewWidth}
                                        containerHeight={viewHeight}
                                    />
                                ))
                            }
                        </PagerView>

                        <TouchableOpacity
                            style={styles.close}
                            onPress={() => setVisible(false)}
                        >
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </GestureHandlerRootView>
            </Modal>
        </View>
    );
}

function ZoomableImage({ uri, containerWidth, containerHeight, index, activeIndex }: { uri: string, containerWidth: number, containerHeight: number, index: number, activeIndex: number }) {
    const [isZoomed, setIsZoomed] = useState(false);
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const tx = useSharedValue(0);
    const ty = useSharedValue(0);

    const savedTx = useSharedValue(0);
    const savedTy = useSharedValue(0);

    useEffect(() => {
        if (index !== activeIndex) {
            scale.value = withSpring(1);
            savedScale.value = 1;
            tx.value = withSpring(0);
            ty.value = withSpring(0);
            savedTx.value = 0;
            savedTy.value = 0;
            setIsZoomed(false);
        }
    }, [activeIndex, index]);

    const updateZoomState = (zoomed: boolean) => {
        setIsZoomed(zoomed);
    };

    // PINCH
    const pinch = Gesture.Pinch()
        .onStart(() => {
            runOnJS(updateZoomState)(true);
        })
        .onUpdate(e => {
            scale.value = Math.max(
                1,
                Math.min(savedScale.value * e.scale, 4)
            );
        })
        .onEnd(() => {
            if (scale.value < 1.1) {
                scale.value = withSpring(1);
                savedScale.value = 1;

                tx.value = withSpring(0);
                ty.value = withSpring(0);
                savedTx.value = 0;
                savedTy.value = 0;
                runOnJS(updateZoomState)(false);
            } else {
                savedScale.value = scale.value;
                const maxTranslateX = (containerWidth * scale.value - containerWidth) / 2;
                const maxTranslateY = (containerHeight * scale.value - containerHeight) / 2;

                if (tx.value < -maxTranslateX) tx.value = withSpring(-maxTranslateX);
                if (tx.value > maxTranslateX) tx.value = withSpring(maxTranslateX);
                if (ty.value < -maxTranslateY) ty.value = withSpring(-maxTranslateY);
                if (ty.value > maxTranslateY) ty.value = withSpring(maxTranslateY);
                runOnJS(updateZoomState)(true);
            }
        });

    // PAN
    const pan = Gesture.Pan()
        .enabled(isZoomed)
        .onStart(() => {
            savedTx.value = tx.value;
            savedTy.value = ty.value;
        })
        .onUpdate(e => {
            if (scale.value > 1) {
                const maxTranslateX = (containerWidth * scale.value - containerWidth) / 2;
                const maxTranslateY = (containerHeight * scale.value - containerHeight) / 2;

                const nextTx = savedTx.value + e.translationX;
                const nextTy = savedTy.value + e.translationY;

                tx.value = Math.min(Math.max(nextTx, -maxTranslateX), maxTranslateX);
                ty.value = Math.min(Math.max(nextTy, -maxTranslateY), maxTranslateY);
            }
        });

    // DOUBLE TAP
    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            if (scale.value > 1) {
                scale.value = withSpring(1);
                savedScale.value = 1;
                tx.value = withSpring(0);
                ty.value = withSpring(0);
                savedTx.value = 0;
                savedTy.value = 0;
                runOnJS(updateZoomState)(false);
            } else {
                scale.value = withSpring(2);
                savedScale.value = 2;
                runOnJS(updateZoomState)(true);
            }
        });

    const composed = Gesture.Simultaneous(
        pinch,
        pan,
        doubleTap
    );

    const style = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateX: tx.value },
            { translateY: ty.value },
        ],
    }));

    return (
        <View style={{ flex: 1 }}>
            {!isZoomed && (
                <>
                    <View style={styles.leftZone} />
                    <View style={styles.rightZone} />
                </>
            )}
            <GestureDetector gesture={composed} >
                <Animated.Image
                    source={{ uri }}
                    style={[{ width: containerWidth, height: containerHeight }, style]}
                    resizeMode="contain"
                />
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",
    },
    sliderContainer: {
        width: width,
        height: width, // Square container
        position: "relative",
    },
    pager: {
        flex: 1,
    },
    slide: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    inlineImage: {
        width: "100%",
        height: "100%",
    },
    badgeContainer: {
        position: "absolute",
        bottom: 12,
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    badgeText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },
    modal: {
        flex: 1,
        backgroundColor: "black",
    },
    fullImage: {
        width,
        height,
    },
    close: {
        position: "absolute",
        top: 40,
        right: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 20,
    },
    closeText: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
    },
    leftZone: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "25%",
        zIndex: 10,
    },
    rightZone: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: "25%",
        zIndex: 10,
    },
});
