module.exports = {
    name: "usernameFormat",
    run: function (user) {
        if (user.discriminator == "0") {
            return user.displayName;
        } else {
            return `${user.tag}`;
        }
    }
}