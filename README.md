# Glowbal

Glowbal shortlist creator + lead capture funnel.

## Frontend env
Set this in the frontend deploy (GitHub Pages build env or local `.env`):

- `VITE_SIGNUP_API_URL=https://<your-render-service>.onrender.com/api/signup`

When set, landing page signups are forwarded to the Render mail relay, which:
1) stores leads
2) sends welcome email from Purelymail

## Mail relay
See `mail-relay/README.md` for Render deploy and SMTP env setup.
