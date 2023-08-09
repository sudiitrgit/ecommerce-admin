import prismadb from "@/lib/prismadb"
import { NextResponse } from "next/server"

const corsHeaders = {
    "Access-Control-Allow-Credentials":"true",
    "Access-Control-Allow-Origin": `${process.env.FRONTEND_STORE_URL}`,
    "Access-Control-Allow-Methods": "PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders});
}

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, addressId: string }}
){
    try {
        const body = await req.json()
        const {userId, phone, accessToken, username, addressline1, addressline2, landmark, pincode, city, state} = body.data;
            

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
            if(!params.addressId ){
                return new NextResponse("Address id is required.", { status: 400 })
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
                const addressUpdate = await prismadb.address.update({
                    where: {
                        id: params.addressId
                    },
                    data: {
                        userId,
                        username,
                        addressline1,
                        addressline2,
                        landmark,
                        pincode,
                        city,
                        state,
                    }
                })
    
                const addresses = await prismadb.address.findMany({
                    where: {
                        userId,
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                })
    
                const addressJsonString = JSON.stringify(addresses) 
                
                return NextResponse.json({ addresses: addressJsonString },  {
                    headers: corsHeaders
                })
            }else{
                return new NextResponse("Unauthorized", {status : 401})
            }
    } catch (error) {
        console.log('[API_PRODUCT_PATCH', error)
        return new NextResponse("Internal error", {status: 500})
    }
}


export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, addressId: string }}
){
    try {
        const body = await req.json();

        const { userId, phone, accessToken } = body;        

        if(!userId ){
            return new NextResponse("User Id is required.", { status: 400 })
        }
        if(!phone ){
            return new NextResponse("Phone is required.", { status: 400 })
        }
        if(!accessToken ){
            return new NextResponse("Token is required.", { status: 400 })
        }   

        if(!params.addressId){
            return new NextResponse("Address Id is required", {status: 400})
        }

        const user = await prismadb.user.findFirst({
            where: {
                phone: phone,
                id: userId,
                accessToken: accessToken
            }
        })

        if(user){

            const addressIdExist = await prismadb.address.findFirst({
                where: {
                    id: params.addressId,
                }
            })
    
            if(!addressIdExist){
                return new NextResponse("address does not exist", { status : 403})
            }
    
            const address = await prismadb.address.deleteMany({
                where: {
                    id: params.addressId,
                },
            })
    
            return NextResponse.json(address,  {
                headers: corsHeaders
            })
        }else{
            return new NextResponse("Unauthorized", {status : 401})
        }
    } catch (error) {
        console.log('[API_ADDRESS_DELETE', error)
        return new NextResponse("Internal error", {status: 500})
    }
}