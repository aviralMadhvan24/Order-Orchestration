import prisma from "../config/db";

import OutboxRepository from "./outbox.repository";

import { publish } from "../kafka/producer";

class OutboxPublisher {

    async publishPendingEvents(){
        const outboxRepository = new OutboxRepository(prisma) ; 
        const events = await outboxRepository.findPendingEvents();

       for (const event of events) {

            try {

                // Publish to Kafka using the event's type as the topic
                await publish(
                    event.eventType,
                    event.payload
                );

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
