# Flag Forge

A feature flag platform for rolling out features gradually, targeting the right users, and killing switches instantly — without a redeploy. Includes a first-party SDK for consuming flags from any Node or browser application.

**Live:** [flag-forge-tawny.vercel.app](https://flag-forge-tawny.vercel.app)

## Preview

---

### landing page

![Landing Page](./screenshots/landing.png)

### dashboard page

![Dashboard](./screenshots/dashboard.png)

### project view 

![Project View](./screenshots/project-view.png)

### flag detail

![Flag Detail](./screenshots/flag-detail.png)

## features

---

- Google/email auth via Kinde
- Projects, environments, and flags with role-based project membership
- Percentage-based gradual rollouts using consistent hashing, so a given user always lands in the same bucket
- Rule-based targeting with nested AND/OR conditions (e.g. `country equals AE`)
- Per-environment flag state — the same flag can be on in staging and off in production
- Scoped API keys — one key per environment, doubling as the tenant boundary for evaluation requests
- Public evaluation endpoint any application can call to check a flag
- Real-time flag change streaming over Server-Sent Events
- A standalone SDK package with both one-shot (`getFlag`) and real-time (`subscribe`) methods
- Audit log of flag state changes (who changed what, when, before/after values), shown per project
- Delete/revoke for projects, environments, flags, and API keys, each behind a confirmation step
- Dockerized for local/self-hosted deployment

## tech used 

---

### stack

- TypeScript
- Next.js (App Router, Server Components, Server Actions)
- PostgreSQL
- Prisma
- Tailwind
- Docker
- Vercel
- Neon

## libraries  

---

- [Kinde](https://kinde.com) – Authentication and session management.
- [Prisma](https://www.prisma.io) – type-safe ORM for POSTGRESQL.
- [@prisma/adapter-pg](https://www.prisma.io/docs/orm/overview/databases/postgresql) – Driver adapter for Prisma's Postgres connections.
- [lucide-react](https://lucide.dev) – for icons.


## Using the SDK

---

the SDK lives in `/sdk` as a standalone package. to try it in the live deployment:

```bash
cd sdk
npm install
npm run build
```

create a project, environment, flag, and API key on the [live dashboard](https://flag-forge-tawny.vercel.app), then create a small script,  example `sdk/test.mjs`:

```js
import { FlagForgeClient } from "./dist/index.js";

const client = new FlagForgeClient({
  apiKey: "YOUR_API_KEY",
  baseUrl: "https://flag-forge-tawny.vercel.app",
});

const result = await client.getFlag("your-flag-key", {
  userId: "test-user-1",
  country: "AE",
});

console.log(result);
// { flagKey: "your-flag-key", enabled: true, reason: "ROLLOUT" }

const unsubscribe = await client.subscribe((event) => {
  console.log("flag changed:", event.flagKey);
});
```

run  it:

```bash
node test.mjs
```

`getFlag` returns the current evaluation for that flag and user. `subscribe` opens a live connection and calls the callback whenever a flag changes in that environment — this works reliably on local dev or docker, but not on the live vercel deployment, since vercel serverless functions don't share memory betwen invocations

## how to run locally 

---

```bash
git clone https://github.com/IzzAbdullah223/flag-forge
cd flag-forge
npm install
```

create a `.env` file:

```
DATABASE_URL=postgresql://user:password@localhost:5432/flags?schema=public
SECRET_KEY=< random string >
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_ISSUER_URL=
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/api/auth/success
```

```bash
npx prisma migrate deploy
npm run dev
```

### docker

```bash
docker compose up --build
```

then open another terminal and run this 

```bash
docker compose exec app npx prisma migrate deploy
```
