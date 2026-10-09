export function isSafeHttpUrl(value: string): boolean {
  try {
    // URL constructor parses the URL. It handles weird encodings/whitespace natively.
    const url = new URL(value);
    
    // Only allow http: and https:
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }
    
    // Reject credentials (e.g., https://user:pass@example.com)
    if (url.username || url.password) {
      return false;
    }
    
    const host = url.hostname;
    
    // Must contain a dot (no single-label hosts like 'localhost')
    if (!host.includes('.')) {
      return false;
    }
    
    // Reject known local/internal domains
    if (
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host === 'localhost'
    ) {
      return false;
    }
    
    // Reject IPv4
    const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
    if (isIPv4) {
      return false;
    }
    
    // Reject IPv6 (URL constructor normalizes IPv6 into brackets like [::1])
    if (host.startsWith('[') && host.endsWith(']')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
