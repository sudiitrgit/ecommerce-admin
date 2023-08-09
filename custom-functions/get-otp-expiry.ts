const GetOtpExpiry = () => {
    var minute = new Date().getMinutes()

    return new Date(new Date().setMinutes(minute+5));
}
 
export default GetOtpExpiry;