
async function encode(text: string,code: string) {
    const myText = new TextEncoder().encode(text);
    const myDigest = await crypto.subtle.digest(
        {
            name: code,// 'SHA-256',
        },
        myText // The data you want to hash as an ArrayBuffer
    );
    // Turn it into a hex string
    const hexString = [...new Uint8Array(myDigest)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    return hexString;

}

export async function encode_sha256(text: string) {
    return encode(text, 'SHA-256');
}