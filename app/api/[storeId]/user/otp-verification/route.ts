import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import jwt from "jsonwebtoken"
import { serialize } from "cookie";
import GetTokenExpiry from "@/custom-functions/get-token-expiry";

const corsHeaders = {
    "Access-Control-Allow-Credentials":"true",
    "Access-Control-Allow-Origin": `${process.env.FRONTEND_STORE_URL}`,
    "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
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
            const { phone, otpdigit1, otpdigit2, otpdigit3, otpdigit4} = body.data;
            const otpReceived = otpdigit1 + otpdigit2 + otpdigit3 + otpdigit4

            if(!phone || phone.length !== 10 || phone[0]<=5 ){
                return new NextResponse("Phone no is not valid.", { status: 400 })
            }

            if(!params.storeId){
                return new NextResponse("Store Id is required", { status : 400})
            }
    
            const user = await prismadb.user.findFirst({
                where: {
                    phone
                }
            })

            if(!user){
                const newuserUrl = `${process.env.FRONTEND_STORE_URL}/login`
                    
                return NextResponse.json({ url: newuserUrl, }, {
                    headers: corsHeaders
                })
            }else{
                const otp = user.otp
                const otpExpiry = user.otpExpiry
                
                if(Number(otpReceived) === otp && otpExpiry > new Date()){

                    const SECRET_KEY = process.env.JWT_SECRET_KEY || "" ;
                    const MAX_AGE = 60*60*24*7;
                    const accessTokenExpiry = GetTokenExpiry();

                    const userJwt = jwt.sign({userId:user.id, phone:user.phone}, SECRET_KEY, {expiresIn: MAX_AGE});

                    const serialized = serialize("OutSiteJwT", userJwt, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "development",
                        sameSite: "strict",
                        maxAge: MAX_AGE,
                        path: "/"

                    })

                    const updateAccessToken = await prismadb.user.updateMany({
                        where: {
                            phone
                        },
                        data: {
                            accessToken: userJwt,
                            accessTokenExpiry: accessTokenExpiry
                        }
                    })
                    
                    const updatedUser = await prismadb.user.findFirst({
                        where: {
                            phone
                        },
                        select: {
                            id: true,
                            phone: true,
                            accessToken: true,
                            storeId: true
                        }
                    })

                    const addresses = await prismadb.address.findMany({
                        where: {
                            userId: updatedUser?.id,
                        },
                        select:{
                            id: true,
                            username: true,
                            pincode: true,
                            addressline1: true,
                            addressline2: true,
                            landmark: true,
                            city: true,
                            state: true
                        },
                        orderBy: {
                            createdAt: "asc"
                        }
                    }) 
                    
                    const successUrl = `${process.env.FRONTEND_STORE_URL}`

                    return NextResponse.json({ url: successUrl, user: updatedUser, addresses: addresses, accessToken: userJwt}, {
                        headers: {
                            "Access-Control-Allow-Credentials":"true",
                            "Access-Control-Allow-Origin": `${process.env.FRONTEND_STORE_URL}`,
                            // "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT,OPTIONS",
                            "Access-Control-Allow-Headers": "Content-Type, Authorization",
                            'Set-Cookie': serialized
                        }
                    })
                    
                }else{
                    const failureUrl = `${process.env.FRONTEND_STORE_URL}/verification-failure`
                    return NextResponse.json({ url: failureUrl,message: "OTP expired"}, {
                            headers: corsHeaders
                        })
                }
            }
    } catch (error) {
        console.log("[API_USER_OTP_VERIFICATIO_POST]", error)
        return new NextResponse("Internal error", {status : 500})
    }
}