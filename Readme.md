# Quick start setup for Prisma ORM and postgreSQL

A quick command breakdown to set up the prisma ORM for a project.
A shortened breakdown of the [official prisma docs](https://www.prisma.io/docs/getting-started/)

# Step 1 - install

inside the project folder with an initialised node environment `npm init` install prisma as a dev dependency

```bash
npm install prisma --save-dev
```

Invoke the Prisma CLI at any time using npx

```bash
npx prisma
```

Initialize prisma to set its dependencies and receive your schema.

```bash
npx prisma init
```

Enter the generated .env file and edit the DATABASE_URL field to fit your connection string

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

if Schema is omitted it will default to the public schema
