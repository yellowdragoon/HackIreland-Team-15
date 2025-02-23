export default async function hashFile(file: File) {
    // Convert the File object to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Compute the hash using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    // Convert the hash to a byte array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Convert bytes to a hex string
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}