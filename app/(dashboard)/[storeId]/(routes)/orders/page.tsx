import {format} from "date-fns"

import prismadb from "@/lib/prismadb";

import { OrderClient } from "./components/client";
import { OrderColumn } from "./components/columns";
import { formatter } from "@/lib/utils";

const OrdersPage = async ({
    params
}: {
    params: { storeId: string}
}) => {
    const orders = await prismadb.order.findMany({
        where: {
            storeId: params.storeId,
            userId: {
                not: ""
            }
        },
        include: {
            orderItems: {
                include: {
                    product: true
                }
            },
            user: true
    
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const formattedOrders: OrderColumn[] = orders.map((item) => ({
        id: item.id,
        phone: item.user.phone  ,
        products: item.orderItems.map((orderItem) => orderItem.product.name + " (" + orderItem.quantity + ")").join(', '),
        totalPrice: formatter.format(item.orderItems.reduce((total, item) => {
            return total + Number(item.product.price) * Number(item.quantity)
        }, 0)),
        isPaid: item.isPaid,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }))

    return ( 
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                 <OrderClient data={formattedOrders}/>
            </div>
            
        </div>
     );
}
 
export default OrdersPage;