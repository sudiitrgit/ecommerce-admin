import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

const corsHeaders = {
    "Access-Control-Allow-Credentials":"true",
    "Access-Control-Allow-Origin": `${process.env.FRONTEND_STORE_URL}`,
    "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders});
}


export async function POST(
    req: Request,
    {params}: { params: { storeId: string}}
) {
    
    try {
        const body = await req.json();
        const {userId, phone, accessToken, productAndQuantity, addressId} = body.data;
        
        if(!userId ){
            return new NextResponse("User Id is required.", { status: 400 })
        }
        if(!phone ){
            return new NextResponse("Phone is required.", { status: 400 })
        }
        if(!accessToken ){
            return new NextResponse("Token is required.", { status: 400 })
        }

        if(!productAndQuantity || productAndQuantity.length === 0){
            return new NextResponse("Product info's are required.", { status: 400 })
        }

        if(!addressId ){
            return new NextResponse("Address is required.", { status: 400 })
        }

        const user = await prismadb.user.findFirst({
            where: {
                phone: phone,
                id: userId,
                accessToken: accessToken
            }
        })

        if(user){
            const productIds = productAndQuantity.map((item: {"productId": string, "quantity": string}) => item.productId)
        
            const products = await prismadb.product.findMany({
                where: {
                    id: {
                        in: productIds
                    }
                }
            }); 
    
            if(products){
                const order = await prismadb.order.create({
                    data: {
                        storeId: params.storeId,
                        isPaid: false,
                        userId: userId,
                        addressId: addressId,
                        orderItems: {
                            create: productAndQuantity.map((item: {"productId": string, "quantity": string}) => ({
                                product: {
                                    connect: {
                                        id: item.productId
                                    }
                                },
                                quantity: Number(item.quantity)
                            }))
                        }
                    },
                    include: {
                        orderItems: {
                            include: {
                                product: true
                            }
                        },
                    },
                })

                const formattedOrders = {
                    id: order.id,
                    products: order.orderItems.map((orderItem) => orderItem.product.name + " (" + orderItem.quantity + ")").join(', '),
                    totalPrice: order.orderItems.reduce((total, item) => {
                        return total + Number(item.product.price) * Number(item.quantity)
                    }, 0),
                    isDelivered: order.isDelivered,
                    isPaid: order.isPaid,
                    createdAt: order.createdAt
                }
        
                const successUrl = `${process.env.FRONTEND_STORE_URL}/account/orders`
                
                return NextResponse.json({ url: successUrl, order: formattedOrders }, {
                    headers: corsHeaders
                })
            }else{
                return new NextResponse("Products not found.", { status: 400 })
            }
        }else{
            return new NextResponse("Unauthorized", {status : 401})
        }     
        
    } catch (error) {
        console.log("[API_CHECKOUT_POST]", error)
        return new NextResponse("Internal error", {status : 500})
    }

}