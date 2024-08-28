// Import PrismaClient
const { PrismaClient } = require('@prisma/client');

// Instantiate PrismaClient
// will expose CRUD and more queries for the defined models.
const prisma = new PrismaClient();

// We are now ready to send queries via our generated Prisma Client API

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
        include: { posts: true, profile: true },
    });
    // print to console.
    console.dir(allUsers, { depth: null });

    // ===============================================
    // ===== Either or above or below, not both ======
    // ===============================================

    /* // Update new user data
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
    console.log(post); */
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
