import { Prisma, PrismaClient } from "@prisma/client";

class InventoryRepository {

    constructor(
        private readonly db: PrismaClient | Prisma.TransactionClient
    ) {}

    async findByProduct(product: string) {

        return this.db.inventory.findUnique({
            where: {
                product,
            },
        });

    }

    async reserveInventory(
        id: string,
        quantity: number
    ) {

        return this.db.inventory.update({

            where: {
                id,
            },

            data: {

                available: {
                    decrement: quantity,
                },

                reserved: {
                    increment: quantity,
                },

            },

        });

    }

}

export default InventoryRepository;