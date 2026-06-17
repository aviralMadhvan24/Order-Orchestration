import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

    await prisma.inventory.createMany({

        data: [

            {
                product: "Laptop",
                available: 10,
            },

            {
                product: "Mouse",
                available: 100,
            },

            {
                product: "Keyboard",
                available: 50,
            },

            {
                product: "Monitor",
                available: 20,
            },

        ],

        skipDuplicates: true,

    });

    console.log("✅ Inventory Seeded");

}

main()
.then(async () => {

    await prisma.$disconnect();

})
.catch(async (err) => {

    console.error(err);

    await prisma.$disconnect();

    process.exit(1);

});