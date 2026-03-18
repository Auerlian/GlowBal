# Glowbal Mail Relay (Render)

Minimal Flask relay for:
1. capturing landing signups
2. sending immediate welcome email via Purelymail SMTP
3. exposing admin lead list endpoint

## Endpoints
- `GET /health`
- `POST /api/signup` `{ name, email, goal, source }`
- `GET /api/leads` with header `x-admin-token: <ADMIN_TOKEN>`

## Deploy on Render
- Blueprint option: use `mail-relay/render.yaml`
- Set env vars in Render:
  - `SMTP_USER=glowbal@purelymail.com`
  - `SMTP_PASS=<your password>`
  - `SENDER_EMAIL=glowbal@purelymail.com`

## Glowbal frontend env
Set in Glowbal frontend deployment:
- `VITE_SIGNUP_API_URL=https://<your-render-service>.onrender.com/api/signup`
