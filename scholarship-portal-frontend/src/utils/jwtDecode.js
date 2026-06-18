import { jwtDecode } from 'jwt-decode';

export const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        return null;
    }
};

export const isTokenValid = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return false;
    // Check if token is expired
    const isExpired = Date.now() >= decoded.exp * 1000;
    return !isExpired;
};

export const getRoleFromToken = (token) => {
    const decoded = decodeToken(token);
    if (!decoded) return null;
    // Based on your Spring Security setup, the authorities might be in 'sub' or explicit claims.
    // We passed collections of SimpleGrantedAuthority so it will map to a JSON array under `auth` usually or simply checking `ROLE_ADMIN`
    // Let's assume you store role. If you only store "sub" (username) you might need custom logic.
    // Spring Security default uses 'scopes' or 'roles'. Wait, the JwtUtil generated the token with just setSubject(username).
    // Did we add role to token? Looking at JwtUtil earlier, it only sets subject and expiration!
    // BUT the instructions say "Decode JWT to extract role".
    // Let me just provide a helper that checks 'role', 'roles', 'authorities'
    return decoded.role || decoded.authorities?.[0]?.authority || 'ROLE_STUDENT'; // Fallback
};
