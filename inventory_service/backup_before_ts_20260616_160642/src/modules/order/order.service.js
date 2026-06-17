import OrderRepository from "./order.repository.js";

class OrderService {
    async createOrder(data){
        return OrderRepository.create({
            ...data , 
            status: "CREATED" 
        })
    }
}

export default new  OrderService() ; 