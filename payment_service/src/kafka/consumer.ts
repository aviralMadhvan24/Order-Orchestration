import kafka from "./client";
import paymentService from "../modules/payment.service";
const consumer = kafka.consumer({
    groupId :"payment-service" ,
})

export async function connectConsumer() {

    await consumer.connect();

    console.log("✅ Inventory Consumer Connected");
    
await consumer.subscribe({
    topic:"payment.process"
});

    await consumer.run({
        eachMessage : async ({message}) =>{
            if(!message.value) return ;
            const data = JSON.parse(
                message.value.toString()
            ) ; 

            
            console.log("📦 Order Event Received", data);

            await paymentService.processPayment(data);
        }
    })
}
export default consumer ; 