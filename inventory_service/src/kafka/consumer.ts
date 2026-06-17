import kafka from "./client";
import inventoryService from "../modules/inventory/inventory.service";

const consumer = kafka.consumer({
    groupId :"inventory-service" ,
})

export async function connectConsumer() {

    await consumer.connect();

    console.log("✅ Inventory Consumer Connected");
    
await consumer.subscribe({
    topic: "inventory.reserve",
});

await consumer.subscribe({
    topic: "inventory.release",
});

await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {

        console.log(
            "Offset:",
            message.offset,
            "Partition:",
            partition
        );

        const data = JSON.parse(message.value!.toString());

        console.log("📦 Order Event Received", data);

        switch (topic) {

    case "inventory.reserve":
        await inventoryService.reserveInventory(data);
        break;

    case "inventory.release":
        await inventoryService.releaseInventory(data);
        break;

}
    }
});
}
export default consumer ; 