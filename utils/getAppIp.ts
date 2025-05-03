import os from 'os';

export async function getAppIp(): Promise<string | null> {
    try {
        // Get all network interfaces
        const networkInterfaces = os.networkInterfaces();
        
        // Find the first non-internal IPv4 address
        for (const interfaceName in networkInterfaces) {
            const interfaces = networkInterfaces[interfaceName];
            if (!interfaces) continue;
            
            for (const iface of interfaces) {
                // Skip internal and non-IPv4 addresses
                if (!iface.internal && iface.family === 'IPv4') {
                    return iface.address;
                }
            }
        }
        
        // Fallback to localhost if no external IP is found
        return '127.0.0.1';
    } catch (error) {
        console.error('Error getting app IP:', error);
        return null;
    }
}