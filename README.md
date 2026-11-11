# Eden International School & College

The Next.js app serves each page at its own route using the original HTML page sources in `legacy-pages/`. Website images, the admission form, and other original media are kept in `public/assets/`; the pages' existing copy and supplied images are preserved.

## Routes

- `/` — Home
- `/about` — About
- `/academics` — Academics
- `/admission` — Admission
- `/contact` — Contacts
- `/faculty` — Faculty
- `/gallery` — Gallery
- `/results` — Results
- `/staff` — All Teachers

Each route has a separate page file under `app/`. Shared page rendering and legacy navigation behavior live in `components/`.

## Run locally

1. Install Node.js 20.9 or newer.
2. Install project dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your MySQL connection string.
4. Run `database/schema.sql` in MySQL to create the database and contact-message table.
5. Start the development server with `npm run dev`.

The contact form stores messages in MySQL. The database table is not created automatically; apply the supplied SQL schema before using the form. Never commit `.env.local` or production database credentials.

Use `npm run typecheck` to check TypeScript and `npm run build` to create a production build.

## Deploy on a free Next.js host

The app can be deployed to Vercel's free Hobby plan or another host that runs a Node.js server:

1. Push the project to a GitHub repository and import it into the hosting provider as a Next.js project.
2. Use Node.js 20.9 or newer. The build command is `npm run build`; the production start command for a Node.js host is `npm start`.
3. Create a MySQL database reachable from the host, then run `database/schema.sql` against it. If the provider pre-creates a database and restricts `CREATE DATABASE` or `USE`, select that database and run the `contact_messages` table definition from the schema.
4. Add `DATABASE_URL` in the host's production environment variables. Use the connection string format shown in `.env.example`; do not commit database credentials.
5. Deploy. The public pages and assets are built by Next.js, and the contact form saves messages through the Node.js API route.

This project is not a static export: the contact API uses Node.js and MySQL. Keep the default Next.js build output; do not set `output: "export"`. Without a reachable MySQL database and `DATABASE_URL`, the site can build and render, but contact form submissions cannot be saved.
