import {prisma} from "../../prisma/prisma";

import OrderRepository from "./order.repository";
import {OrderStatus} from "@prisma/client"
import { Prisma } from "@prisma/client";


class OrderService {

    async createOrder(data: Prisma.OrderCreateInput) {

        const orderRepository = new OrderRepository(prisma);

        return orderRepository.create({
            ...data,
            status: OrderStatus.PENDING,
        });

    }

}

export default new OrderService();