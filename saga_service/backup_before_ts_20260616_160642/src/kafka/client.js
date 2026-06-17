import {Kafka} from "kafkajs" ; 

const kafka = new Kafka({
    clientId: "order-service",
    brokers : ["localhost:9092"]
});
export default kafka ; 