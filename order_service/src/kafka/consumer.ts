import kafka from "./client";
import prisma from "../config/db";
import { OrderStatus } from "@prisma/client";

const consumer = kafka.consumer({
    groupId: "order-service",
});

export async function connectConsumer() {

    await consumer.connect();

    console.log("✅ Order Consumer Connected");

    await consumer.subscribe({
        topic: "order.confirm",
    });

    await consumer.subscribe({
        topic: "order.cancel",
    });

    await consumer.run({

        eachMessage: async ({ topic, message }) => {

            if (!message.value) return;

            const data = JSON.parse(
                message.value.toString()
            );

            console.log(`📩 ${topic}`, data);

            switch (topic) {

                case "order.confirm":

                    await prisma.order.update({

                        where: {
                            id: data.orderId,
                        },

                        data: {
                            status: OrderStatus.CONFIRMED,
                        },

                    });

                    console.log("✅ Order Confirmed");

                    break;

                case "order.cancel":

                    await prisma.order.update({

                        where: {
                            id: data.orderId,
                        },

                        data: {
                            status: OrderStatus.CANCELLED,
                        },

                    });

                    console.log("❌ Order Cancelled");

                    break;

            }

        },

    });

}

export default consumer;