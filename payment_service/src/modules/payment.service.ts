import prisma from "../config/db";

import PaymentRepository from "./payment.repository";
import OutboxRepository from "../outbox/outbox.repository";

import {
    Prisma,
    PaymentStatus
} from "@prisma/client";

class PaymentService {

    async processPayment(data: {

        orderId: string;

        amount: number;

    }) {

        return prisma.$transaction(async(tx)=>{

            const paymentRepository =
                new PaymentRepository(tx);

            const outboxRepository =
                new OutboxRepository(tx);

            const success =
                Math.random() > 0.2;

            const payment =
                await paymentRepository.create({

                    orderId:data.orderId,

                    amount:data.amount,

                    transactionId:
                        crypto.randomUUID(),

                    status: success
                        ? PaymentStatus.SUCCESS
                        : PaymentStatus.FAILED
                });

            await outboxRepository.createEvent({

                aggregateId:data.orderId,

                aggregateType:"Payment",

                eventType: success
                    ? "payment.completed"
                    : "payment.failed",

                payload:{

                    orderId:data.orderId,

                    paymentId:payment.id,

                    amount:data.amount

                }

            });

        });

    }

}

export default new PaymentService();