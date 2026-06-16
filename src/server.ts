import "dotenv/config";

import app from "./app";
import { connectProducer } from "./kafka/producer";
import outboxPublisher from "./outbox/outbox.publisher";
const PORT = process.env.PORT || 3000;

async function start ()  {

    
    await connectProducer() ; 

    setInterval(async ()=> {
        try {
            await outboxPublisher.publishPendingEvents() ;
            
        } catch (error) {
            console.log("Outbox publisher error : ", error);
            
        }
    },5000);
    
    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
}

start() ;