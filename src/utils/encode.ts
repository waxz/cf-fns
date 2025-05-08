
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

export function encodeToHex(str) {
    return str.replace(/[\s\S]/g, ch => {
        const code = ch.charCodeAt(0);
        return (code < 32 || code > 126 || ch === '"' || ch === '\\')
            ? '\\x' + code.toString(16).padStart(2, '0')
            : ch;
    });
}

export function decodeFromHex(str) {
    return str.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
    );
}

export function isHexEncoded(str) {
    return /\\x[0-9A-Fa-f]{2}/.test(str);
}

export function replace_text(text, host) {
    const is_hex = isHexEncoded(text);
    console.log(`replace_text: is_hex ${is_hex}, text: ${text}`)
    if (!text) return text;


    if(is_hex){
        const updated =  text.replace(/(["'])(.*?\\x[0-9A-Fa-f]{2}.*?)(\1)/g, (match, quote, encoded, endQuote) => {
            // Safely decode and re-encode this matched hex string
            const decoded = decodeFromHex(encoded);
            const updated = decoded.replace(/https?:\/\//g, `${host}/proxy/https://`);
            const reencoded = encodeToHex(updated);
            return `${quote}${reencoded}${endQuote}`;
        });
        console.log(`replace_text: is_hex ${is_hex}, updated: ${updated}`)
    
        return updated;
    }else{
        const updated =  text.replace(/https?:\/\//g, `${host}/proxy/https://`);

        console.log(`replace_text: is_hex ${is_hex}, updated: ${updated}`)
    
        return updated;
    }
    return text;
}