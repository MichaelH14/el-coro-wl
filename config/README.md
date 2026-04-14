# El Coro — Config

Copy `el-coro.example.json` to `el-coro.json` and fill in your values:

```bash
cp config/el-coro.example.json config/el-coro.json
```

Then edit `config/el-coro.json` with:
- `owner.name` — your name (used in agent prompts)
- `vps.host` — your VPS IP
- `vps.user` — your VPS SSH user
- `vps.remoteDir` — remote path for El Coro data
- `services` — list of services the monitor agent watches
- `notifications.whatsapp` — optional WhatsApp API config (for alerts)
- `products` — list of products the growth/support agents track

The `config/el-coro.json` file is in `.gitignore` — never commit your personal config.
