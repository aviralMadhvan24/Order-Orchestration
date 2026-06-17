import kafka from "./client";

const producer = kafka.producer();

export async function connectProducer() {
    await producer.connect();
    console.log("✅ Kafka Producer Connected");
}

export async function publish(
    topic: string,
    message: unknown
) {
    await producer.send({
        topic,
        messages: [
            {
                value: JSON.stringify(message),
            },
        ],
    });
}

export default producer;