const { getGoogleOauthToken, getGoogleUser } =  require("./session");

const User = require("../../models/Users");
const googleOauthHandler = async (req, res, next) => {
	try {
		// Get the code from the query
		const code = req.params.code;
        const pathUrl = req.query.state || "/";
        console.log(code);

		if (!code) {
			return next(new AppError("Authorization code not provided!", 401));
		}

		// Use the code to get the id and access tokens
		const { id_token, access_token } = await getGoogleOauthToken(code);

		// Use the token to get the User
		const { name, verified_email, email, picture } = await getGoogleUser({
			id_token,
			access_token,
		});
		console.log(access_token);

		// Check if user is verified
		if (!verified_email) {
			return next(new AppError("Google account not verified", 403));
		}

		const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(200).json("User not found")
        }

		// res.redirect(`${config.get("origin")}${pathUrl}`);
        return res.status(200).json("User")
	} catch (err) {
		console.log("Failed to authorize Google User", err);
		return res.json("http://localhost:5173/oauth/error");
	}
};

module.exports = {
    googleOauthHandler
}