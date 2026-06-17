import { Prisma, PrismaClient } from "@prisma/client";

class PaymentRepository {

    constructor(
        private readonly db:
        PrismaClient | Prisma.TransactionClient
    ) {}

    async create(payment: Prisma.PaymentCreateInput) {
        return this.db.payment.create({
            data: payment,
        });
    }
}

export default PaymentRepository;