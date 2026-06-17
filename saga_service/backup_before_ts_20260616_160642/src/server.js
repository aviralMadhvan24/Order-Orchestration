import "dotenv/config";

import app from "./app.js";
import { connectProducer } from "./kafka/producer.js";
const PORT = process.env.PORT || 3000;

async function start ()  {

    await connectProducer() ; 
    
    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
}

start() ;