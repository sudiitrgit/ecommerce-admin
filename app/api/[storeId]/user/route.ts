import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

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
        const {userId, phone, accessToken} = body.data;
        
        if(!userId ){
            return new NextResponse("User Id is required.", { status: 400 })
        }
        if(!phone ){
            return new NextResponse("Phone is required.", { status: 400 })
        }
        if(!accessToken ){
            return new NextResponse("Token is required.", { status: 400 })
        }

        const user = await prismadb.user.findFirst({
            where: {
                phone: phone,
                id: userId,
                accessToken: accessToken
            }
        })

        if(user){
            return NextResponse.json({status: 200}, {
                headers: corsHeaders
            })
        }else{
            return new NextResponse("Unauthorized", {status : 401})
        }     
        
    } catch (error) {
        console.log("[API_USER_POST]", error)
        return new NextResponse("Internal error", {status : 500})
    }
}