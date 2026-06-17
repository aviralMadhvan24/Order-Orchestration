import prisma from "../../config/db.js";

class OrderRepository {
    async create(order){
        return prisma.order.create({
            data:order,
        })
    }
}

export default new OrderRepository() ;