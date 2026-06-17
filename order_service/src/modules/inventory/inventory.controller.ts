import orderService from "./inventory.service";

class OrderController {
    async create(req, res) {
        try {
            const order = await orderService.createOrder(req.body);

            return res.status(201).json(order);

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                message: err.message,
            });

        }
    }
}

export default new OrderController();