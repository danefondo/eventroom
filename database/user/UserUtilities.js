const User = require('./UserModel');

async function getUserById(id) {
    return await User.findById(id).exec();
}

async function getUserByProviderId(providerId) {
    return await User.findOne({ providerId }).exec()
}

async function createUser({
    username, 
    firstName, 
    lastName, 
    email, 
    hashedPassword, 
    verificationToken,
    provider,
    providerId,
    displayName,
    verifiedStatus,
    }) {
    return new Promise(async (resolve, reject) => {
        const user = await User.findOne({username: username});
        if (user) {
            if (!provider || user.provider == provider) reject("Username already in use;")
        }
        const newUser = new User({
            username,
            firstName,
            lastName,
            password: hashedPassword,
            provider,
            providerId,
            displayName: displayName || username,
            email,
            verifiedStatus: verifiedStatus || false,
            verificationToken,
            dateCreated: new Date()
        });
        return resolve(
            await newUser.save()
        );
    });
}

function checkIfUserWithValueExists(field, value) {
    // for checking whether various information, such as username or email give results to detect whether the email is already used or not
    return new Promise((resolve, reject) => {
        User.findOne({ [field]: value }, function (err, user) {
            if (err) {
                return reject(err);
            }
            return user ? resolve(true) : resolve(false);
        })
    })
}

module.exports = {checkIfUserWithValueExists, getUserById, createUser, getUserByProviderId };