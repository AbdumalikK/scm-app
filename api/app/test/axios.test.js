const axios = require('axios');

function cb(response){
    console.log("Response: ", response.data);
}

(async () => {
    await axios({
        method: 'post',
        url: 'http://localhost:8081/users',
        withCredentials: true,
        data: {
            firstName: 'alisher',
            lastName: 'abdullaev',
            role: 'student',
            password: '12345678qwe',
            phone: '+998909999999'
        },
        headers: { 
          "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6Iis5"
          + "OTg5OTY5ODM2NjkiLCJpYXQiOjE2MzQ3Njg2MjcsImV4cCI6MTYzNDg1NTAyN30.k1SSmL0JaPodxZLHljmNvTWkoxWvUi3Ad0c7s2LKywA",
          "Content-Type": "application/x-www-form-urlencoded",
          "Cache-Control": "no-cache",
          "Postman-Token": "42e6c291-9a09-c29f-f28f-11872e2490a5"
        }
    }).then(cb);
})();