import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";



const corsHeaders = {
    
    "Access-Control-Allow-Origin": `${process.env.FRONTEND_STORE_URL}`,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-requested-with",
    "Vary": "Origin"
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
            const {userId, phone, accessToken,username, addressline1, addressline2, landmark, pincode, city, state} = body.data;
            

            if(!userId ){
                return new NextResponse("User Id is required.", { status: 400 })
            }
            if(!phone ){
                return new NextResponse("Phone is required.", { status: 400 })
            }
            if(!accessToken ){
                return new NextResponse("Token is required.", { status: 400 })
            }
            if(!username ){
                return new NextResponse("Username is required.", { status: 400 })
            }
            if(!addressline1 ){
                return new NextResponse("Address is required.", { status: 400 })
            }
            if(!addressline2 ){
                return new NextResponse("Address is required.", { status: 400 })
            }
            if(!landmark ){
                return new NextResponse("Landmark is required.", { status: 400 })
            }
            if(!pincode ){
                return new NextResponse("Pincode is required.", { status: 400 })
            }
            if(!city ){
                return new NextResponse("City is required.", { status: 400 })
            }
            if(!state ){
                return new NextResponse("State is required.", { status: 400 })
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
                const address = await prismadb.address.create({
                    data: {
                        userId,
                        username,
                        addressline1,
                        addressline2,
                        landmark,
                        pincode,
                        city,
                        state,
                    },
                    select: {
                        id: true,
                        username: true,
                        addressline1: true,
                        addressline2: true,
                        landmark: true,
                        pincode: true,
                        city: true,
                        state: true,
                    }
                })
                
                return NextResponse.json({ address: address },  {
                    headers: corsHeaders
                })
            }else{
                return new NextResponse("Unauthorized", {status : 401})
            }
    } catch (error) {
        console.log("[API_USER_OTP_VERIFICATIO_POST]", error)
        return new NextResponse("Internal error", {status : 500})
    }
}