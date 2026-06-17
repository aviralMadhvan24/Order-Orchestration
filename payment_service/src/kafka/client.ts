import {Kafka} from "kafkajs" ; 

const kafka = new Kafka({
    clientId: "payment-service",
    brokers : ["localhost:9092"]
});
export default kafka ; 