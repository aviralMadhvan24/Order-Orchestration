import kafka from "./client";
import inventoryService from "../modules/inventory/inventory.service";

const consumer = kafka.consumer({
    groupId :"inventory-service" ,
})

export async function connectConsumer() {

    await consumer.connect();

    console.log("✅ Inventory Consumer Connected");
    
    await consumer.subscribe({
        topic :"orders.created",
        
    })

    await consumer.run({
        eachMessage : async ({message}) =>{
            if(!message.value) return ;
            const data = JSON.parse(
                message.value.toString()
            ) ; 

            
            console.log("📦 Order Event Received", data);

            await inventoryService.reserveInventory(data);
        }
    })
}
export default consumer ; 