const User = require('./models/UserModel');

const UserInteractionUtilities = require('./UserInteractionUtilities');

async function getUserById(id) {
    return await User.findById(id).exec();
}

async function getUserByProviderId(providerId) {
    return await User.findOne({ providerId }).exec()
}

async function getUserByEmail(email) {
    const users = await User.find({ email: email }).select('+password').exec();
    // console.log("users: ", users);
    // console.log("type of users: ", typeof(users));
    if (users) {
        for (let i=0; i<users.length; i++){
            if ((!users[i].provider || users[i].provider === null) && users[i].password != null) {
                // console.log("return user", users[i]);
                // console.log("Type of return user", typeof(users[i]));
                return users[i];
            }
        }
    }
    console.log("Return null");
    return null;
}

async function getUserByUsername(username) {
    return await User.findOne({ username }).exec()
}

async function getUserByUsernameWithPassword(field, username) {
    return await User.findOne({[field]: username}).select('+password').exec();
}

async function getUserByVerificationToken(verificationToken) {
    return await User.findOne({ verificationToken }).exec()
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
        console.log("@utils", typeof(newUser._id));
        return resolve(
            Promise.all([newUser.save(), UserInteractionUtilities.createUserInteraction(newUser._id, newUser.displayName, newUser.username)])
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


module.exports = {checkIfUserWithValueExists, createUser, 
    getUserById, getUserByProviderId, getUserByEmail, getUserByUsername, getUserByVerificationToken, getUserByUsernameWithPassword };