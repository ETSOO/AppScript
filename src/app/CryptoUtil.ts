// Types, safe to remove all from es2026
declare global {
  interface Uint8Array {
    toHex(): string;
    toBase64(): string;
  }
  interface Uint8ArrayConstructor {
    fromHex(hex: string): Uint8Array<ArrayBuffer>;
    fromBase64(base64: string): Uint8Array<ArrayBuffer>;
  }
}

// Runtime implementation
if (!Uint8Array.prototype.toHex) {
  Uint8Array.prototype.toHex = function (this: Uint8Array): string {
    let hex = "";
    for (let i = 0; i < this.length; i++) {
      hex += this[i].toString(16).padStart(2, "0");
    }
    return hex;
  };
}
if (!Uint8Array.prototype.toBase64) {
  Uint8Array.prototype.toBase64 = function (this: Uint8Array): string {
    if (typeof btoa === "function") {
      let binary = "";
      const len = this.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(this[i]);
      }
      return btoa(binary);
    }

    throw new Error("No native base64 encoding support found in environment.");
  };
}

if (!Uint8Array.fromHex) {
  Uint8Array.fromHex = function (hex: string): Uint8Array<ArrayBuffer> {
    const cleanHex = hex.replace(/\s+/g, "");
    if (cleanHex.length % 2 !== 0) {
      throw new Error("Invalid hex string: length must be even.");
    }

    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      const byte = parseInt(cleanHex.substring(i, i + 2), 16);
      if (Number.isNaN(byte)) {
        throw new Error(`Invalid hex character at index ${i}`);
      }
      bytes[i / 2] = byte;
    }
    return bytes;
  };
}

if (!Uint8Array.fromBase64) {
  Uint8Array.fromBase64 = function (base64: string): Uint8Array<ArrayBuffer> {
    if (typeof atob === "function") {
      const cleanBase64 = base64.replace(/[\n\r\s]/g, "");
      const binary = atob(cleanBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }

    throw new Error("No native base64 decoding support found in environment.");
  };
}

/**
 * Crypto utilities
 */
export namespace CryptoUtil {
  // Create PBKDF2 key for AES-CBC encryption
  async function createPBKDF2Key(
    passphrase: Uint8Array<ArrayBuffer>,
    salt: Uint8Array<ArrayBuffer>,
    iterations: number,
    usage: KeyUsage[]
  ) {
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passphrase,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 1000 * iterations,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-CBC", length: 256 },
      false,
      usage
    );

    return key;
  }

  /**
   * AES (CBC) 256-bit symmetric encryption
   * @param message Plain text message to encrypt
   * @param passphrase Secret passphrase
   * @param iterations Multiplier for PBKDF2 iterations (1000 * iterations), default 1 (range 1 - 99)
   * @returns Formatted payload: 2-digit iterations + 32-char Hex salt + 32-char Hex IV + Base64 ciphertext
   */
  export async function encrypt(
    message: string,
    passphrase: string,
    iterations: number = 1
  ): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(16));

    const encoder = new TextEncoder();

    const key = await createPBKDF2Key(
      encoder.encode(passphrase),
      salt,
      iterations,
      ["encrypt"]
    );

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      encoder.encode(message)
    );

    return (
      iterations.toString().padStart(2, "0") +
      salt.toHex() +
      iv.toHex() +
      new Uint8Array(encryptedBuffer).toBase64()
    );
  }

  /**
   * AES (CBC) 256-bit symmetric decryption (Compatible with C# AESDecrypt)
   * @param cipherText Encrypted string containing iterations, salt, IV, and ciphertext
   * @param passphrase Secret passphrase
   * @returns Decrypted string or null if decryption fails
   */
  export async function decryptStr(
    cipherText: string,
    passphrase: string
  ): Promise<string | null> {
    const decryptedBytes = await decrypt(cipherText, passphrase);
    if (decryptedBytes == null) return null;

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBytes);
  }

  /**
   * AES (CBC) 256-bit symmetric decryption (Compatible with C# AESDecrypt)
   * @param cipherText Encrypted string containing iterations, salt, IV, and ciphertext
   * @param passphrase Secret passphrase
   * @returns Decrypted byte array (Uint8Array) or null if decryption fails
   */
  export async function decrypt(
    cipherText: string,
    passphrase: string
  ): Promise<ArrayBuffer | null> {
    if (cipherText.length <= 66) return null;

    const iterationsNum = parseInt(cipherText.substring(0, 2), 10);
    if (isNaN(iterationsNum)) return null;

    try {
      const salt = Uint8Array.fromHex(cipherText.substring(2, 34));
      const iv = Uint8Array.fromHex(cipherText.substring(34, 66));
      const encrypted = Uint8Array.fromBase64(cipherText.substring(66));

      const encoder = new TextEncoder();

      const key = await createPBKDF2Key(
        encoder.encode(passphrase),
        salt,
        iterationsNum,
        ["decrypt"]
      );

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        key,
        encrypted
      );

      return decryptedBuffer;
    } catch (e) {
      console.error(`CryptoUtil.decrypt error:`, e);

      return null;
    }
  }

  /**
   * Hash message using SHA-256 or HmacSHA512, formatted as Base64
   * @param message Message to hash
   * @param passphrase Secret passphrase for HMAC (optional)
   * @returns Base64 encoded hash string
   */
  export async function hash(message: string, passphrase?: string) {
    const bytes =
      passphrase == null
        ? await sha256(message)
        : await hmacSha512(message, passphrase);
    return bytes;
  }

  /**
   * Hash message using SHA-256 or HmacSHA512, formatted as Base64
   * @param message Message to hash
   * @param passphrase Secret passphrase for HMAC (optional)
   * @returns Base64 encoded hash string
   */
  export async function hash64(
    message: string,
    passphrase?: string
  ): Promise<string> {
    const bytes = await hash(message, passphrase);
    return new Uint8Array(bytes).toBase64();
  }

  /**
   * Hash message using SHA-256 or HmacSHA512, formatted as Uppercase Hex
   * @param message Message to hash
   * @param passphrase Secret passphrase for HMAC (optional)
   * @returns Uppercase Hex string
   */
  export async function hashHex(
    message: string,
    passphrase?: string
  ): Promise<string> {
    const bytes = await hash(message, passphrase);
    return new Uint8Array(bytes).toHex();
  }

  /**
   * Hash message using SHA-256
   * @param message Message to hash
   * @returns SHA-256 hash as ArrayBuffer
   */
  export async function sha256(message: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(message)
    );
    return hashBuffer;
  }

  /**
   * Hash message using HMAC-SHA-512
   * @param message Message to hash
   * @param passphrase Secret passphrase for HMAC
   * @returns HMAC-SHA-512 hash as ArrayBuffer
   */
  export async function hmacSha512(
    message: string,
    passphrase: string
  ): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(passphrase),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(message)
    );
    return signature;
  }
}
