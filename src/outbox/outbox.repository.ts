import { Prisma , PrismaClient } from "@prisma/client";

class OutboxRepository {

    constructor (
        private readonly db : PrismaClient | Prisma.TransactionClient 
    ){}

    async createEvent(event :Prisma.OutboxEventCreateInput){
        return this.db.outboxEvent.create({
            data:event , 
        })
    }
}

export default  OutboxRepository ;