import { Twilio } from "twilio";

const SendSms = async (phone: string, message: string) => {
    const accountSid = `${process.env.TWILIO_ACCOUNT_SID}`;
    const token = `${process.env.TWILIO_AUTH_TOKEN}`;
    const client = new Twilio(accountSid, token);
    const phoneplus91 = "+91"+phone
    const result = await client.messages
        .create({
        body: message,
        from: '+17622257637',
        to: phoneplus91,
        })
        
    return result;
}
 
export default SendSms;