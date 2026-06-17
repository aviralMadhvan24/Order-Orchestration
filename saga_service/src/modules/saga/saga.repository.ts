import {
    Prisma,
    PrismaClient
} from "@prisma/client";

class SagaRepository {

    constructor(

        private readonly db:
            PrismaClient |
            Prisma.TransactionClient

    ) {}

    async create(
        data: Prisma.SagaCreateInput
    ) {

        return this.db.saga.create({

            data,

        });

    }

    async findByOrderId(
        orderId: string
    ) {

        return this.db.saga.findUnique({

            where: {

                orderId,

            },

        });

    }

    async updateState(

        orderId: string,

        state: string

    ) {

        return this.db.saga.update({

            where: {

                orderId,

            },

            data: {

                state,

            },

        });

    }

}

export default SagaRepository;