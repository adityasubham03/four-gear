const axios = require("axios");

const getGoogleOauthToken = async (code) => {
    const rootURl = "https://oauth2.googleapis.com/token";
	console.log(code);

	const options = {
		code,
		client_id:
			"159465763231-a3t2hr0dmoj0d9fh69k5g0aokmf462d6.apps.googleusercontent.com",
		client_secret: "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",
		redirect_uri: "http://localhost:5000/api/oauth/provider/google",
		grant_type: "authorization_code",
	};
	try {
		const res = await axios.post(rootURl, options, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
        });
        console.log(res);

		return res.data;
	} catch (err) {
		console.log(err);
		console.log("Failed to fetch Google Oauth Tokens");
		throw new Error(err);
	}
};

async function getGoogleUser({ id_token, access_token }) {
	try {
		const { data } = await axios.get(
			`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
			{
				headers: {
					Authorization: `Bearer ${id_token}`,
				},
			}
		);

		return data;
	} catch (err) {
		console.log(err);
		throw Error(err);
	}
}

module.exports = {
	getGoogleUser,
	getGoogleOauthToken,
};
