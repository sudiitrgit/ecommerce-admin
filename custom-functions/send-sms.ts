import { Twilio } from "twilio";

// twilio recovery code = G7WVT5THTLT5RHFDEEV7BYJY

const SendSms = async (phone: string, message: string) => {
    const accountSid = `${process.env.TWILIO_ACCOUNT_SID}`;
    const token = `${process.env.TWILIO_AUTH_TOKEN}`;
    const client = new Twilio(accountSid, token);
    const phoneplus91 = "+91"+phone
    const result = await client.messages
        .create({
        body: message,
        from: `${process.env.TWILIO_PHONE_NO}`,
        to: phoneplus91,
        })
        
    return result;
}
 
export default SendSms;