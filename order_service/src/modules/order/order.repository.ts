import { Prisma , PrismaClient } from "@prisma/client";

class OrderRepository {

    constructor (
        private readonly db : PrismaClient | Prisma.TransactionClient 
    ){}

    async create(order :Prisma.OrderCreateInput){
        return this.db.order.create({
            data:order , 
        })
    }
}

export default  OrderRepository ;