const GetTokenExpiry = () => {
    var day = new Date().getDay()

    return new Date(new Date().setDate(day+7));
}
 
export default GetTokenExpiry;