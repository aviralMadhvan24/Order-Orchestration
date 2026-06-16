import "dotenv/config";

import app from "./app";
import { connectProducer } from "./kafka/producer";
const PORT = process.env.PORT || 3000;

async function start ()  {

    await connectProducer() ; 
    
    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
}

start() ;