This is a Next.js interview prototype with a shared admin setting backed by Supabase Postgres.

## Admin setup

1. Create a Supabase project and run [supabase/schema.sql](supabase/schema.sql) in its SQL editor.
2. Copy `.env.example` to `.env.local`. Set `SUPABASE_URL` to the project URL, `SUPABASE_SERVICE_ROLE_KEY` to its server-side service role key, and `ADMIN_PASSWORD` to a strong password. Set the same variables in your deployment environment.
3. Start the app and open `/admin`. Sign in with the admin password and switch on **Allow continuation without camera and microphone**. New candidate visits read this shared setting from the server.

The service role key stays on the server. Keep `.env.local` private. The admin password is held in page memory for the current tab and sent to the app API over HTTPS; it is not saved in browser storage. This prototype does not yet persist candidate recordings or typed answers as submissions.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
