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

# Step 2 - Connect database

Enter the generated .env file and edit the DATABASE_URL field to fit your connection string

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

if Schema is omitted it will default to the public schema

# Step 3 - Schema models and Prisma Migrate

Prisma schemas are defined inside prisma/schema.prisma

and consist of data models like:

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String   @db.VarChar(255)
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String?
  user   User    @relation(fields: [userId], references: [id])
  userId Int     @unique
}

model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  name    String?
  posts   Post[]
  profile Profile?
}
```

A useful example for reference when laying out your data models

**migrate data models after changing them using prisma migrate**

```bash
npx prisma migrate dev --name init
```

Prisma now generates a SQL miration file for this setup and runs it against the database.
This works much like a git version control as each migration is saved independently.

# Part 4 - The Prisma client

To use the Prisma client, install it with npm.

```bash
npm install @prisma/client
```

    Whenever the Prisma schema is updated, make sure to update the database schema using either prisma migrate dev or prisma db push

## Part 4.2 - Querying - prisma findMany()

With Prisma client installed and wired up to the database and schemas, we can start writing queries with it.

Import `PrismaClient` where querying is needed in the project, and use its methods to interact with the database.

```javascript
// Import PrismaClient
const { PrismaClient } = require('@prisma/client');

// Instantiate PrismaClient
const prisma = new PrismaClient();

// We are now ready to send queries via our generated Prisma Client API

// Define async functions in main to query to database
async function main() {
    // write prisma client queries here
    // call pre-defined prisma function from user schema "findMany()" reading all User records.
    const allUsers = await prisma.user.findMany();
    // print to console.
    console.log(allUsers);
}

// Call main, and handle success or error cases
main()
    .then(async () => {
        //success, disconnect
        await prisma.$disconnect();
    })
    .catch(async (err) => {
        // error, console error and disconnect
        console.error(err);
        await prisma.$disconnect();
        process.exit(1);
    });
```

running `node index.js` should return `[]` since we have no data yet, but this shows that it works!

## Part 4.3 - Querying - prisma create({})

Expand on this by querying `prisma.user.create({})` with some data

```javascript
// Import PrismaClient
// will expose CRUD and more queries for the defined models.
const { PrismaClient } = require('@prisma/client');

// Instantiate PrismaClient
const prisma = new PrismaClient();

// Define async functions in main to query to database
async function main() {
    // write prisma client queries here
    // create users in database using pre-defined prisma function for user schema
    await prisma.user.create({
        // Submit following data
        data: {
            name: 'danishKodeMonkey',
            email: 'danish@KodeMonkey.banana',
            // NOTE: Call create inside a nested write query
            // adds data to relevant reference table "posts", specifically title.
            posts: { create: { title: 'Hello world' } },
            // again, add data to profile table, specifically bio
            profile: { create: { bio: 'I like bananas' } },
        },
    });
    // call pre-defined prisma function from user schema "findMany()" reading all User records.
    const allUsers = await prisma.user.findMany({
        // include tells prisma to include posts and profile relations on returned User objects.
        // THis way we get the actual contents, not just the reference id.
        include: { posts: true, profile: true },
    });
    // print to console.
    console.dir(allUsers, { depth: null });
}

// Call main, and handle success or error cases
main()
    .then(async () => {
        //success, disconnect
        await prisma.$disconnect();
    })
    .catch(async (err) => {
        // error, console error and disconnect
        console.error(err);
        await prisma.$disconnect();
        process.exit(1);
    });
```

Remember the relations between the schemas.
User is connected to Post and Profile, so we can add data to those tables by using create in `nested write` queries.

If everything went right, our `node index.js` should return the following

```bash
❯ node index.js
[
  {
    id: 1,
    email: 'danish@KodeMonkey.banana',
    name: 'danishKodeMonkey',
    posts: [
      {
        id: 1,
        createdAt: 2024-08-28T08:39:15.072Z,
        updatedAt: 2024-08-28T08:39:15.072Z,
        title: 'Hello world',
        content: null,
        published: false,
        authorId: 1
      }
    ],
    profile: { id: 1, bio: 'I like bananas', userId: 1 }
  }
]
```

## Part 4.4 - Querying - prisma update({})

Updating using prisma is similar to create, specify what column should be updated with what data.

Removing or quoting the other operations we did, and using the following instead will update our data.

```javascript
// Update new user data
// updated data will be assigned to post after operation
// initiate update operation on 'post' table
const post = await prisma.post.update({
    // where id is 1
    where: { id: 1 },
    // update with following data
    data: {
        // set published to true
        published: true,
    },
});
// log updated post to console
console.log(post);
```

Running our project now will return our updated post, with published set to true

```bash
❯ node index.js
{
  id: 1,
  createdAt: 2024-08-28T08:39:15.072Z,
  updatedAt: 2024-08-28T08:49:12.216Z,
  title: 'Hello world',
  content: null,
  published: true,
  authorId: 1
}
```

# Conclusion

With that we have set up our prisma ORM in our development environment, and tested its functionality.

The project is now ready to be expanded upon!

Again, this is meant as a quick-start setup that can be referred to for a quick and easy point of reference when starting up a Prisma ORM setup.

For a full in-depth guide, see [the official prisma docs](https://www.prisma.io/docs/getting-started/)
