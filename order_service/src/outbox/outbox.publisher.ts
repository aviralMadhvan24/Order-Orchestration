import prisma from "../config/db";

import OutboxRepository from "./outbox.repository";

import { publish } from "../kafka/producer";

class OutboxPublisher {

    async publishPendingEvents(){
        const outboxRepository = new OutboxRepository(prisma) ; 
        const events = await outboxRepository.findPendingEvents();

       for (const event of events) {

            try {
<<<<<<< HEAD

                // Publish to Kafka using the event's type as the topic
                await publish(
                    event.eventType,
                    event.payload
                );
=======
   console.log("Publishing to topic:", event.eventType);
                // Publish to Kafka
await publish(
    event.eventType,
    event.payload
);
>>>>>>> a64fd6359925853b899b34b38ae5590ff8118ba3

                // Mark event as processed
                await outboxRepository.markProcessed(event.id);

                console.log(
                    `Published event ${event.id}`
                );

            } catch (err) {

                console.error(
                    `Failed to publish ${event.id}`,
                    err
                );

                await outboxRepository.incrementRetry(event.id);

            }

        }

    }

}

export default new OutboxPublisher();
