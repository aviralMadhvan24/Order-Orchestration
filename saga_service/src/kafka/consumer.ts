import kafka from "./client";
import sagaService from "../modules/saga/saga.service";

const consumer = kafka.consumer({
    groupId: "saga-service",
});

const TOPICS = [
    "orders.created",
    "inventory.reserved",
    "inventory.failed",
    "payment.completed",
    "payment.failed",
];

export async function connectConsumer() {

    await consumer.connect();

    console.log("✅ Saga Consumer Connected");

    for (const topic of TOPICS) {
        await consumer.subscribe({ topic });
    }

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {

    console.log(
      "Offset:",
      message.offset,
      "Partition:",
      partition
    );

    const data = JSON.parse(message.value!.toString());

    console.log(`📩 Event Received: ${topic}`);
    console.log(data);

    await sagaService.handleEvent(topic, data);
  },
});
}

export default consumer;