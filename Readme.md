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

Prisma now generates a SQL migration file for this setup and runs it against the database.

# Part 4 - The Prisma client

To use the Prisma client, install it with npm.

```bash
npm install @prisma/client
```

    Whenever the Prisma schema is updated, make sure to update the database schema using either prisma migrate dev or prisma db push.

Alternatively, if a change is made on the database using SQL manually, e.g using

```sql
CREATE TABLE
```

or

```SQL
ALTER TABLE
```

etc. You can use a introspection approach to update the prisma schema, based on the current state of the database, and generate a prisma client from there.

TO do this

1. Update the database table manually using SQL
2. use `prisma db pull` to pull the latest database tables, and update the prisma schema
3. use `prisma generate` to manually prompt a update to the prisma client.

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

### findUnique()

use `findUnique({})` to return a single record identified by a unique identifier or ID.

```javascript
const user = await prisma.user.findUnique({
    where: {
        id: 2,
    },
});
```

### findFirst()

use `findFirst({})` to return the most recently created record with matching columns.

```javascript
const findUser = await prisma.user.findFirst({
    where: {
        posts: {
            name: 'somePostName',
        },
    },
});
```

**More about find operations [here](https://www.prisma.io/docs/orm/prisma-client/queries/crud)**

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

## Part 4.4 - Querying - prisma createMany({})

`createMany({})` creates bulk insertion operations to the database, accepting multiple data objects, skipping any duplicates.

```javascript
const createMany = await prisma.user.createMany({
    data: [
        { name: 'Foo', email: 'foo@mail.com' },
        { name: 'Bar', email: 'bar@nail.net' },
    ],
    skipDuplicates: true,
});
```

on the Database side, prisma queries a single `INSERT INTO` query with multiple values, providing quick and efficient operation times.

    Alternatively, use `createManyAndReturn({ })` to perform the same operation, but return the resulting objects.

## Part 4.5 - Querying - prisma update({})

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

## Part 4.6 - Querying - prisma upsert({})

A combination of both update and insert(create) operations, try to update a user record, if it fails(does not exist) create the user record.

```javascript
const upsetUser = await prisma.user.upsert({
    where: {
        email: 'foo@bar.net',
    },
    // try to update
    update: { name: 'FooBar' },
    // if failed, create.
    create: { email: 'foo@bar.net', name: 'FooBar' },
});
```

## Part 4.7 - Querying - deleteMany()

to delete multiple records, use `deleteMany()`

```javascript
const deleteMany = await prisma.user.deleteMany({
    where: {
        id: [1, 2, 3, 4, 5],
    },
});
```

I should not have to stress how dangerous using deleteMany({}) without any specifying parameters where: is... if I do, it would delete ALL records on the table.

# Conclusion

With that we have set up our prisma ORM in our development environment, and tested its functionality.

The project is now ready to be expanded upon!

Again, this is meant as a quick-start setup that can be referred to for a quick and easy point of reference when starting up a Prisma ORM setup.

For a full in-depth guide, see [the official prisma docs](https://www.prisma.io/docs/getting-started/)

Below are various notes to keep in mind setting up the Prisma ORM

# Notes 1 - Prisma Relations

Prisma handles relations of foreign keys between tables under the hood for the database.

There are three types of table relations to keep in mind
One-To-One
One-To-Many
Many-To-Many

A easy overview of different ways to link two tables together can be described in the following snippet

```prisma
model User {
  id      Int      @id @default(autoincrement())
  posts   Post[] //  User-Post, One-To-Many (User ONE, posts MANY)
  profile Profile? // User-Profile, One-To-One (User ONE, profile ONE)
}

model Profile {
  id     Int  @id @default(autoincrement())
  user   User @relation(fields: [userId], references: [id]) // User-Profile, One-To-One (User One, profile ONE)
  userId Int  @unique // relation scalar field (used in the `@relation` attribute above)
}

model Post {
  id         Int        @id @default(autoincrement())
  author     User       @relation(fields: [authorId], references: [id]) // Post-User, One-To-Many(User ONE, Posts MANY)
  authorId   Int // relation scalar field  (used in the `@relation` attribute above)
  categories Category[] // Posts-Categories, Many-To-Many (Posts MANY, categories MANY)
}

model Category {
  id    Int    @id @default(autoincrement())
  posts Post[] // Posts-Categories, Many-To-Many(Posts MANY, categories MANY)
}
```

In short, the different relations can be established as follows:
`One-To-One`
User is tried to Profile by referencing the profile model with `Profile?` (`?` is a optional indicator of a field, omit to make it required.)
Profile is tied to User by referencing User model with the `@relation` attribute, and the `userId scalar field`, referencing the User model `id` field

    Which side of the One-To-One relation holds the @relation attribute is up to you, choose whichever makes the most sense

`One-To-Many`
User is tied to the Post model using `Post[]`
Post is tied to the User model using the `author` column, with the `@relation` attribute, and the `authorId` scalar field, referencing the user model `id` field

`Many-To-Many`
Post is tied to Category using `Post[]`
Category is tied to User using `User[]`

Furthermore, in the case of a `Many-To-Many` relationship, there are two types to keep in mind.

#### `Explicit Many-To-Many`

relations, requiring you to define a seperate relations table between two tables, in the above example called CategoriesOnPost that.

This model, at minimum, requires:

a `post` and `postId` column, relating to the `post` model using the `postId` scalar field

a `category` and `categoryId` column, relating to the `category` model using the `categoryId` scalar field

A composite primary key `@@id([postId, categoryId])` which ensures each combination of postId and categoryId is unique in the table, preventing the same category to be assigned ot the same post more than once in the relation.

#### `Implicit Many-To-Many`

relations, however, lets Prisma ORM manage the relation table under the hood, the model will not appear in the prisma table.

Both of these methods have pros and cons
`Explicit`
**Pros:** Flexible, Great control, clear semantics, easy to migrate and evolve
**Cons:** More boilerplate, manual management, more complex queries

`Implicit`
**Pros:** Flexible, less code, automatic management, cleaner schema.
**Const:** Limited flexibility, reduced control, Harder to migrate and evolve.
