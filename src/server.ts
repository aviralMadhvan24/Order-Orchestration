import { connectConsumer } from "./kafka/consumer";
import { connectProducer } from "./kafka/producer";
import outboxPublisher from "./outbox/outbox.publisher";
import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 3001;

async function start() {

    await connectProducer();

    await connectConsumer();

    setInterval(async () => {

        await outboxPublisher.publishPendingEvents();

    },5000);

    app.listen(PORT,()=>{

        console.log("Inventory Service Running");

    });

}

start();