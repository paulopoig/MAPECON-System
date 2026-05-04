const bcrypt = require('bcrypt');

// Change 'Mapecon2026' to whatever password you want to use!
const myNewPassword = 'Mapecon2026'; 

bcrypt.hash(myNewPassword, 10).then(hash => {
    console.log("===============================");
    console.log("YOUR NEW DATABASE HASH IS:");
    console.log(hash);
    console.log("===============================");
});