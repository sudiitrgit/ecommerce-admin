const GenerateOtp = () => {
    let digits = '0123456789';
    let otpString = '';
    while(otpString.length <4)
    {
        let index = Math.floor(Math.random()*10);
        if(index==0 && otpString.length==0){
            otpString = ''
        }else{
            otpString = otpString + digits[index];
        }
        
    }
    const otp = Number(otpString)
    return otp;
}
 
export default GenerateOtp;