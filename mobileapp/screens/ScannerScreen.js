import {Camera, useCameraDevice, useCodeScanner} from "react-native-vision-camera";
// ScannerScreen.js
export default function ScannerScreen({ navigation }) {
    const device = useCameraDevice("back");
    const codeScanner = useCodeScanner({
        codeTypes: ["ean-13"],
        onCodeScanned: (codes) => {
            const scanned = codes[0]?.value;
            if (scanned) {
                navigation.goBack();
                // You can use a global context or emit scanned value
            }
        },
    });

    return (
        <View style={styles.cameraContainer}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                codeScanner={codeScanner}
            />
            <TouchableOpacity
                style={styles.closeScanner}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.closeText}>Close Scanner</Text>
            </TouchableOpacity>
        </View>
    );
}
