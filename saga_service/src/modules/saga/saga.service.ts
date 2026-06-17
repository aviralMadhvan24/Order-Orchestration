import prisma from "../../config/db";
import { Prisma } from "@prisma/client";
import OutboxRepository from "../../outbox/outbox.repository";
import SagaRepository from "./saga.repository";
interface OrderCreatedEvent {
    orderId: string;
    product: string;
    quantity: number;
    amount: number;

}

interface InventoryEvent {
    orderId: string;
    product: string;
    quantity: number;
    amount: number;
}

interface PaymentEvent {
    orderId: string;
    paymentId: string;
    amount: number;
}

class SagaService {

    async handleEvent(
        topic: string,
        data: unknown
    ) {

        switch (topic) {

            case "orders.created":
                return this.handleOrderCreated(
                    data as OrderCreatedEvent
                );

            case "inventory.reserved":
                return this.handleInventoryReserved(
                    data as InventoryEvent
                );

            case "inventory.failed":
                return this.handleInventoryFailed(
                    data as InventoryEvent
                );

            case "payment.completed":
                return this.handlePaymentCompleted(
                    data as PaymentEvent
                );

            case "payment.failed":
                return this.handlePaymentFailed(
                    data as PaymentEvent
                );

            default:
                console.log(`Unknown event: ${topic}`);
        }

    }


private async handleOrderCreated(
    data: OrderCreatedEvent
) {

    await prisma.$transaction(async (tx) => {

        const sagaRepository =
            new SagaRepository(tx);

        const outboxRepository =
            new OutboxRepository(tx);

        // Save Saga
        await sagaRepository.create({

            orderId: data.orderId,

            product: data.product,

            quantity: data.quantity,

            amount: data.amount,

            state: "ORDER_CREATED",

        });

        console.log("🚀 Sending Inventory Reserve Command");

await outboxRepository.createEvent({

    aggregateId: data.orderId,

    aggregateType: "Saga",

    eventType: "inventory.reserve",

    payload: {
        orderId: data.orderId,
        product: data.product,
        quantity: data.quantity,
        amount: data.amount,
    },

});

    });

}

private async handleInventoryReserved(
    data: InventoryEvent
) {

    await prisma.$transaction(async (tx) => {

        const sagaRepository =
            new SagaRepository(tx);

        const outboxRepository =
            new OutboxRepository(tx);

        await sagaRepository.updateState(

            data.orderId,

            "INVENTORY_RESERVED"

        );

        console.log("💳 Sending Payment Process Command");

        await outboxRepository.createEvent({

            aggregateId: data.orderId,

            aggregateType: "Saga",

            eventType: "payment.process",

            payload: {

                orderId: data.orderId,

                amount: data.amount,

            },

        });

    });

}

private async handleInventoryFailed(
    data: InventoryEvent
) {

    await prisma.$transaction(async (tx) => {

        const sagaRepository = new SagaRepository(tx);
        const outboxRepository = new OutboxRepository(tx);

        await sagaRepository.updateState(
            data.orderId,
            "INVENTORY_FAILED"
        );

        console.log("❌ Inventory Reservation Failed");

        await outboxRepository.createEvent({

            aggregateId: data.orderId,

            aggregateType: "Saga",

            eventType: "order.cancel",

            payload: {
                orderId: data.orderId,
            },

        });

    });

}

private async handlePaymentCompleted(
    data: PaymentEvent
) {

    await prisma.$transaction(async (tx) => {

        const sagaRepository = new SagaRepository(tx);
        const outboxRepository = new OutboxRepository(tx);

        await sagaRepository.updateState(
            data.orderId,
            "PAYMENT_COMPLETED"
        );

        console.log("✅ Sending Order Confirm Command");

        await outboxRepository.createEvent({

            aggregateId: data.orderId,

            aggregateType: "Saga",

            eventType: "order.confirm",

            payload: {
                orderId: data.orderId,
            },

        });

    });

}

private async handlePaymentFailed(
    data: PaymentEvent
) {

    await prisma.$transaction(async (tx) => {

        const sagaRepository = new SagaRepository(tx);
        const outboxRepository = new OutboxRepository(tx);

        await sagaRepository.updateState(
            data.orderId,
            "PAYMENT_FAILED"
        );

        const saga = await sagaRepository.findByOrderId(
            data.orderId
        );

        if (!saga) {
            throw new Error("Saga not found");
        }

        console.log("❌ Payment Failed");

        await outboxRepository.createEvent({

            aggregateId: saga.orderId,

            aggregateType: "Saga",

            eventType: "inventory.release",

            payload: {

                orderId: saga.orderId,

                product: saga.product,

                quantity: saga.quantity,

            },

        });

        await outboxRepository.createEvent({

            aggregateId: saga.orderId,

            aggregateType: "Saga",

            eventType: "order.cancel",

            payload: {

                orderId: saga.orderId,

            },

        });

    });

}

}

export default new SagaService();