import { NextResponse } from "next/server";


export async function POST(
    req: Request,
    {params}: { params: { storeId: string}}
) {
   
    return new NextResponse("Unauthorized", {status : 401})

}