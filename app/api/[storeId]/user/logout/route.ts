import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";


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
        const { phone} = body.phone;
            
        const updateAccessToken = await prismadb.user.updateMany({
            where: {
                phone
            },
            data: {
                accessToken: "",
                accessTokenExpiry: new Date()
            }
        })

        const updatedUser = await prismadb.user.findFirst({
            where: {
                phone
            }
        })

        const successUrl = `${process.env.FRONTEND_STORE_URL}`
        
        return NextResponse.json({ url: successUrl}, {
            headers: corsHeaders
        })
           
            
    } catch (error) {
        console.log("[API_USER_LOGOUT_POST]", error)
        return new NextResponse("Internal error", {status : 500})
    }
}