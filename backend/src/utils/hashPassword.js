const bcrypt = require('bcrypt');

async function hashPassword(password, saltRounds = 10) {
    return bcrypt.hash(password, saltRounds);
}

module.exports = hashPassword;

if (require.main === module) {
    hashPassword('password123')
        .then((hashedPassword) => {
            console.log(hashedPassword);
        })
        .catch((error) => {
            console.error(error);
            process.exitCode = 1;
        });
}