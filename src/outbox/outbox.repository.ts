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
    async findPendingEvents(){
        return this.db.outboxEvent.findMany({
            where :{
                processed:false ,
            },
            orderBy :{
                createdAt :"asc",
            }
        })
    }

     // Mark event as processed
    async markProcessed(id: string) {
        return this.db.outboxEvent.update({
            where: {
                id,
            },
            data: {
                processed: true,
                processedAt: new Date(),
            },
        });
    }

    // Increment retry count
    async incrementRetry(id: string) {
        return this.db.outboxEvent.update({
            where: {
                id,
            },
            data: {
                retryCount: {
                    increment: 1,
                },
            },
        });
    }
}

export default OutboxRepository;