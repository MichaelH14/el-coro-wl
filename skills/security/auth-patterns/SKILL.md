---
name: auth-patterns
description: Use when implementing authentication or authorization, including JWT, OAuth, sessions, password hashing, or role-based access control
---

# Auth Patterns

Authentication and authorization. JWT by default, bcrypt for passwords, RBAC for permissions.

## Preconditions

- User model exists with email/password or OAuth fields
- HTTPS enforced (never send tokens over HTTP)
- Secret keys generated and stored in environment variables

## Steps

### 1. JWT (Access + Refresh Tokens)

**Access token**:
- Short-lived: 15 minutes
- Contains: user_id, role, issued_at
- Sent in `Authorization: Bearer <token>` header
- Verified on every protected request

**Refresh token**:
- Long-lived: 7 days
- Stored in httpOnly secure cookie (not localStorage)
- Used only to get new access tokens
- Rotated on every use (one-time use refresh tokens)

```javascript
// Generate
const accessToken = jwt.sign({ userId, role }, ACCESS_SECRET, { expiresIn: '15m' });
const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });

// Verify
const decoded = jwt.verify(token, ACCESS_SECRET);
```

### 2. Password Hashing

ALWAYS bcrypt. Never MD5, SHA1, or SHA256 for passwords.

```javascript
const hash = await bcrypt.hash(password, 12); // cost factor 12
const valid = await bcrypt.compare(password, hash);
```

Rules:
- Cost factor >= 12 (adjust for ~250ms hash time)
- Never store plaintext passwords anywhere (not even logs)
- Never send password back in API responses

### 3. Session Management

- Generate session ID with `crypto.randomBytes(32)`
- Store server-side (Redis or database), not in cookie value
- Cookie flags: `httpOnly`, `secure`, `sameSite: 'strict'`
- Session expiry: 24 hours of inactivity
- Invalidate all sessions on password change

### 4. OAuth 2.0

For third-party login (Google, GitHub, etc.):

Flow:
1. Redirect user to provider's authorization URL
2. Receive callback with authorization code
3. Exchange code for access token (server-side, never client)
4. Fetch user profile from provider
5. Create or link local account
6. Issue local JWT

Store provider tokens encrypted. Never expose to client.

### 5. RBAC (Role-Based Access Control)

Define roles:
```javascript
const ROLES = {
  admin: ['read', 'write', 'delete', 'manage_users'],
  user: ['read', 'write'],
  viewer: ['read']
};
```

Middleware:
```javascript
function requirePermission(permission) {
  return (req, res, next) => {
    if (!ROLES[req.user.role]?.includes(permission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

Check permissions at the route level, not in business logic.

## Verification / Exit Criteria

- Access tokens expire in <= 15 minutes
- Refresh tokens are httpOnly cookies, rotated on use
- Passwords hashed with bcrypt (cost >= 12)
- No tokens or passwords in logs or error messages
- RBAC enforced on all protected routes
- OAuth tokens stored encrypted server-side
