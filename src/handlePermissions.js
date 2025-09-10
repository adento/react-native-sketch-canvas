import { PermissionsAndroid, Platform } from 'react-native';

export const requestPermissions = async (permissionDialogTitle, permissionDialogMessage) => {
    if (Platform.OS === 'android') {
        // For Android 13+ (API 33+), we need different permissions
        if (Platform.Version >= 33) {
            // Android 13+ uses scoped storage, may not need WRITE_EXTERNAL_STORAGE
            // Check if the app has the required permissions for media files
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                ], {
                    title: permissionDialogTitle || 'Media Access Permission',
                    message: permissionDialogMessage || 'This app needs access to save sketches to your device.',
                });
                
                return granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn('Permission request error:', err);
                return false;
            }
        } else if (Platform.Version >= 30) {
            // Android 11+ (API 30+) has scoped storage but may still need WRITE_EXTERNAL_STORAGE for compatibility
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: permissionDialogTitle || 'Storage Permission',
                        message: permissionDialogMessage || 'This app needs access to save sketches to your device.',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn('Permission request error:', err);
                return false;
            }
        } else {
            // Android 10 and below
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: permissionDialogTitle || 'Storage Permission',
                    message: permissionDialogMessage || 'This app needs access to save sketches to your device.',
                }
            );

            // On devices before SDK version 23, the permissions are automatically granted if they appear in the manifest,
            // so check and request should always be true.
            // https://github.com/facebook/react-native-website/blob/master/docs/permissionsandroid.md
            const isAuthorized = Platform.Version >= 23 ? granted === PermissionsAndroid.RESULTS.GRANTED : granted === true;
            return isAuthorized;
        }
    }
    return true;
}