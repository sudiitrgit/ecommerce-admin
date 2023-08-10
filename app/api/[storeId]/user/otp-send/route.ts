import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

import GenerateOtp from "@/custom-functions/generate-otp";
import SendSms from "@/custom-functions/send-sms";
import GetOtpExpiry from "@/custom-functions/get-otp-expiry";

const corsHeaders = {
    
    "ACCESS_CONTROL_ALLOW_CREDENTIALS" : "true",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",

};

export async function OPTIONS() {
    return NextResponse.json({status: 200}, { headers: corsHeaders});
}

export async function POST(
    req: Request,
    {params}: { params: { storeId: string}}
) {
   
    try {
            const body = await req.json();
            const phone = body.data.phone;

            if(!phone || phone.length !== 10 || phone[0]<=5 ){
                return new NextResponse("Phone no is not valid.", { status: 400 })
            }

            if(!params.storeId){
                return new NextResponse("Store Id is required", { status : 400})
            }
    
            let user = await prismadb.user.findFirst({
                where: {
                    phone
                }
            })

            const otp = GenerateOtp();
            const otpExpiry = GetOtpExpiry();
    
            
            if(!user){
                 user = await prismadb.user.create({
                    data: {
                        storeId: params.storeId,
                        phone,
                        otp,
                        otpExpiry

                    }
                })
            }else{
                const existingUser = await prismadb.user.updateMany({
                    where: {
                        phone
                    },
                    data: {
                        otp,
                        otpExpiry
                    }
                })
            }
            user = await prismadb.user.findFirst({
                where: {
                    phone
                }
            })
            
            const userId = user?.id
            const message = "Your OTP form chai-sutta.com is "+otp +" OTP valid for 5 minutes only"
    
            const result = await SendSms(phone, message);

            if(result.errorMessage){
                console.log(result.errorMessage)

                return new NextResponse("OTP sending error", {status : 500})   
            }
            else{
                const successUrl = `${process.env.FRONTEND_STORE_URL}/${userId}/otp-verification/`
                return NextResponse.json({status: 200, url: successUrl, phone },  {
                    headers: corsHeaders
                })
            }
            

    } catch (error) {
        console.log("[API_USER_OTP_SEND_POST]", error)
        return new NextResponse("Internal error", {status : 500})
    }
}