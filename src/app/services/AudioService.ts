import { createSound, RecordBackType, PlayBackType } from 'react-native-nitro-sound';
import RNFS from 'react-native-fs';
import { Platform, PermissionsAndroid } from 'react-native';
import { AppConfig } from '../config/api';

class AudioService {
    private sound = createSound();
    private currentPath: string | null = null;

    // Request permissions for Android
    async requestPermissions() {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                ]);
                return granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    }

    // Start recording
    async startRecording() {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                throw new Error('Microphone permission not granted');
            }
            const fileName = `voice_${Date.now()}.m4a`;
            const path = `${RNFS.CachesDirectoryPath}/${fileName}`;

            console.log('[AudioService] Starting recorder with path:', path);
            await this.sound.startRecorder(path);

            this.sound.addRecordBackListener((e: RecordBackType) => {
                // Optional: handle metering or progress
            });
        } catch (error) {
            console.error('[AudioService] Failed to start recording', error);
            throw error;
        }
    }

    // Stop recording
    async stopRecording(): Promise<string> {
        try {
            const result = await this.sound.stopRecorder();
            this.sound.removeRecordBackListener();
            return result; // URI of the recorded file
        } catch (error) {
            console.error('Failed to stop recording', error);
            throw error;
        }
    }

    // Start playing
    async startPlaying(path: string, onProgress?: (pos: number, dur: number) => void) {
        try {
            this.currentPath = path;
            await this.sound.startPlayer(path);
            this.sound.addPlayBackListener((e: PlayBackType) => {
                if (onProgress) {
                    onProgress(e.currentPosition, e.duration);
                }
            });
            this.sound.addPlaybackEndListener(() => {
                this.stopPlaying();
                if (onProgress) onProgress(0, 0); // Reset progress
            });
        } catch (error) {
            console.error('Failed to start playback', error);
            throw error;
        }
    }

    // Stop playing
    async stopPlaying() {
        try {
            this.currentPath = null;
            await this.sound.stopPlayer();
            this.sound.removePlayBackListener();
            this.sound.removePlaybackEndListener();
        } catch (error) {
            console.error('Failed to stop playback', error);
            throw error;
        }
    }

    // Pause playing
    async pausePlaying(path?: string) {
        try {
            if (path && this.currentPath !== path) return;
            await this.sound.pausePlayer();
        } catch (error) {
            console.error('Failed to pause playback', error);
            throw error;
        }
    }

    // Resume playing
    async resumePlaying(path?: string) {
        try {
            if (path && this.currentPath !== path) return;
            await this.sound.resumePlayer();
        } catch (error) {
            console.error('Failed to resume playback', error);
            throw error;
        }
    }

    // Format time for display (seconds to mm:ss)
    formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Convert file to Base64 for socket transfer
    async fileToBase64(filePath: string): Promise<string> {
        try {
            const cleanPath = filePath.replace('file://', '');
            return await RNFS.readFile(cleanPath, 'base64');
        } catch (error) {
            console.error('Failed to read file as base64', error);
            throw error;
        }
    }

    // Get base URL for media
    getBaseUrl(): string {
        return AppConfig.SOCKET_URL;
    }

    // Save Base64 to file
    async base64ToFile(base64: string, fileName: string): Promise<string> {
        try {
            const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
            // If it's a data URL, strip the prefix
            const cleanBase64 = base64.includes(';base64,') ? base64.split(';base64,')[1] : base64;
            await RNFS.writeFile(path, cleanBase64, 'base64');
            return Platform.OS === 'android' ? `file://${path}` : path;
        } catch (error) {
            console.error('Failed to save base64 to file', error);
            throw error;
        }
    }

    // Download remote URL to local cache for stable playback
    async downloadRemoteFile(url: string, fileName: string): Promise<string> {
        try {
            const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
            // Clear existing if any to avoid issues
            if (await RNFS.exists(path)) {
                await RNFS.unlink(path);
            }

            console.log('[AudioService] Downloading:', url);
            const result = await RNFS.downloadFile({
                fromUrl: url,
                toFile: path,
                background: true,
            }).promise;

            if (result.statusCode !== 200) {
                throw new Error(`Download failed with status ${result.statusCode}`);
            }

            return Platform.OS === 'android' ? `file://${path}` : path;
        } catch (error) {
            console.error('[AudioService] Download failed', error);
            throw error;
        }
    }
}

export default new AudioService();
