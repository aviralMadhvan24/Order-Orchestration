import "dotenv/config";

import app from "./app";

import { connectProducer } from "./kafka/producer";
import { connectConsumer } from "./kafka/consumer";

import outboxPublisher from "./outbox/outbox.publisher";

const PORT = process.env.PORT || 3002;

async function start() {

    await connectProducer();

    await connectConsumer();

    setInterval(async () => {
        await outboxPublisher.publishPendingEvents();
    }, 5000);

    app.listen(PORT, () => {
        console.log(" Saga Service Running");
    });

}

start();