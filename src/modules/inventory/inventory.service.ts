import prisma from "../../config/db";

import InventoryRepository from "./inventory.repository";
import OutboxRepository from "../../outbox/outbox.repository";

class InventoryService {

    async reserveInventory(data: {

        orderId: string;

        product: string;

        quantity: number;

    }) {

        return prisma.$transaction(async (tx) => {

            const inventoryRepository =
                new InventoryRepository(tx);

            const outboxRepository =
                new OutboxRepository(tx);

            const inventory =
                await inventoryRepository.findByProduct(
                    data.product
                );

            if (!inventory) {

                throw new Error("Product not found");

            }

            if (inventory.available < data.quantity) {

                await outboxRepository.createEvent({

                    aggregateId: data.orderId,

                    aggregateType: "Inventory",

                    eventType: "inventory.failed",

                    payload: {

                        orderId: data.orderId,

                        reason: "INSUFFICIENT_STOCK",

                    },

                });

                return;

            }

            await inventoryRepository.reserveInventory(

                inventory.id,

                data.quantity

            );

            await outboxRepository.createEvent({

                aggregateId: data.orderId,

                aggregateType: "Inventory",

                eventType: "inventory.reserved",

                payload: {

                    orderId: data.orderId,

                    product: data.product,

                    quantity: data.quantity,

                },

            });

        });

    }

}

export default new InventoryService();