import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
    
    "Access-Control-Allow-Origin": `${process.env.FRONTEND_STORE_URL}`,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Origin ,Content-Type, Accept",
    "Vary": "Origin",
    "Access-Control-Max-Age": "86400"
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
            const {orderId, userId, phone, accessToken} = body.data;
            

            if(!userId ){
                return new NextResponse("User Id is required.", { status: 400 })
            }
            if(!phone ){
                return new NextResponse("Phone is required.", { status: 400 })
            }
            if(!accessToken ){
                return new NextResponse("Token is required.", { status: 400 })
            }
            if(!orderId ){
                return new NextResponse("Order id is required.", { status: 400 })
            }


            if(!params.storeId){
                return new NextResponse("Store Id is required", { status : 400})
            }
    
            const user = await prismadb.user.findFirst({
                where: {
                    phone: phone,
                    id: userId,
                    accessToken: accessToken
                }
            })

            if(user){
                const order = await prismadb.order.findUnique({
                    where: {
                        storeId: params.storeId,
                        userId: userId,
                        id: orderId
                    },
                    select:{
                        id: true,
                        isDelivered: true,
                        isPaid: true
                    }

                })

                
                return NextResponse.json({ order: order },  {
                    headers: corsHeaders
                })
            }
    } catch (error) {
        console.log("[API_USER_OTP_VERIFICATIO_POST]", error)
        return new NextResponse("Internal error", {status : 500})
    }
}