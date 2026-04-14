---
name: whatsapp-bot-patterns
description: Use when building or modifying a WhatsApp bot via Tae, handling messages, media, groups, sessions, or bot commands
---

# WhatsApp Bot Patterns

Build WhatsApp bots via the Tae platform. Message handling, state management, media, and rate limiting.

## Preconditions

- Tae gateway active (`ws://127.0.0.1:18789`)
- WhatsApp number linked and authenticated
- Bot command set defined

## Steps

### 1. Message Handling

Incoming message flow:
1. Receive from Tae WebSocket gateway
2. Parse: sender, text, media, group context, timestamp
3. Route: command vs conversation vs media
4. Process and respond
5. Log interaction

Message types to handle:
- **Text**: commands (prefixed) or conversational
- **Media**: images, audio, video, documents
- **Location**: lat/lng
- **Contact**: vcard
- **Reaction**: emoji reaction to message

### 2. Command System

Commands prefixed with `/` or `!`:
```
/resultados  — latest lottery results
/ayuda       — help menu
/estado      — service status
```

Command parsing:
- Extract command name and arguments
- Validate command exists
- Check user permissions (if applicable)
- Execute and respond

Unknown commands: respond with closest match suggestion or help menu.

### 3. Session Management

Per-user conversation state:
```json
{
  "user_id": "phone_number",
  "state": "awaiting_selection",
  "context": { "draw_type": "nacional" },
  "last_activity": "timestamp",
  "session_ttl": 300
}
```

- Session expires after 5 minutes of inactivity
- On expiry: reset to default state
- Do not carry stale context across sessions

### 4. Media Handling

Sending media:
- Images: result cards, charts, screenshots
- Audio: voice responses (if enabled)
- Documents: reports, exports

Rules:
- Compress images before sending (< 1MB)
- Caption on every image (accessibility)
- Never send unsolicited media (only in response to request)

### 5. Group Behavior

Groups require different handling:
- Only respond to direct mentions or commands (not every message)
- Prefix responses with @mention of requester
- Rate limit per group: max 5 responses per minute
- Never send proactive messages to groups without admin opt-in

### 6. Rate Limits

WhatsApp enforces strict limits:
- Message send rate: max 80 messages per minute across all chats
- Media send rate: lower than text
- Template messages: require pre-approval for business accounts

Self-imposed limits:
- Per user: max 10 responses per minute
- Per group: max 5 responses per minute
- Queue messages that exceed limits, deliver with delay

## Verification / Exit Criteria

- All message types handled (text, media, location, contact, reaction)
- Commands parsed correctly with argument extraction
- Sessions expire after TTL and reset cleanly
- Group messages only triggered by mention or command
- Rate limits enforced (no WhatsApp ban risk)
- All interactions logged for support and analytics
