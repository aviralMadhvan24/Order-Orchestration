import OutboxRepository from "../../outbox/outbox.repository";
import {prisma} from "../../prisma/prisma";

import OrderRepository from "./order.repository";
import {OrderStatus} from "@prisma/client"
import { Prisma } from "@prisma/client";


class OrderService {

    async createOrder(data: Prisma.OrderCreateInput) {

        return await prisma.$transaction(async(tx)=> {
            const orderRepository = new OrderRepository(tx) ; 
            const outboxRepository = new OutboxRepository(tx) ; 

            const order = await orderRepository.create({
                ...data,
                status : OrderStatus.PENDING
            })
            
            
            await outboxRepository.createEvent({
                aggregateId: order.id,
                aggregateType: "Order",
                eventType: "OrderCreated",
                
                payload: {
                    orderId: order.id,
                    product: order.product,
                    quantity: order.quantity,
                    amount: order.amount,
                    status: order.status,
                },
                
                processed: false,
                retryCount: 0,
            });
            return order ;
        })

    }

}

export default new OrderService();