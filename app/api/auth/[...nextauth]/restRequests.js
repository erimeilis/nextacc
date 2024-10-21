"use server"
import axios from "axios";

export async function kcToken(token) {
    const response = await axios.post(
        process.env.KEYCLOAK_REALM + '/protocol/openid-connect/token',
        'client_id=' + process.env.KEYCLOAK_CLIENT_ID +
        '&client_secret=' + process.env.KEYCLOAK_CLIENT_SECRET +
        '&grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange' +
        '&subject_token_type=urn%3Aietf%3Aparams%3Aoauth%3Atoken-type%3Aaccess_token' +
        '&subject_token=' + token +
        '&subject_issuer=google',
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    )
    return response.data
}

export async function kcCreds(username, password) {
    const response = await axios.post(
        process.env.KEYCLOAK_REALM + '/protocol/openid-connect/token',
        'client_id=' + process.env.KEYCLOAK_CLIENT_ID +
        '&client_secret=' + process.env.KEYCLOAK_CLIENT_SECRET +
        '&grant_type=password' +
        '&username=' + username +
        '&password=' + password,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    )
    console.log(response.data)
    return response.data
}

export async function kcGetAdminToken() {
    const response = await axios.post(
        process.env.KEYCLOAK_REALM + '/protocol/openid-connect/token',
        'client_id=' + process.env.KEYCLOAK_ADMIN_ID +
        '&client_secret=' + process.env.KEYCLOAK_ADMIN_SECRET +
        '&grant_type=client_credentials',
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    )
    return response.data.access_token
}

export async function kcCreateUser(username, password, adminToken, phone = '') {
    //console.log(phone)
    const request = await axios.post(
        process.env.KEYCLOAK_ADMIN_REALM + '/users',
        {
            'username': username,
            'email': username,
            'emailVerified': false,
            'enabled': true,
            'credentials': [{
                'temporary': false,
                'type': 'password',
                'value': password
            }],
            'attributes': {
                'phone': phone
            }
        },
        {
            headers: {
                'Authorization': 'Bearer ' + adminToken,
            }
        }
    );
    return request.status
}

export async function redToken(token) {
    const response = await axios.get(
        process.env.REDREPORT_URL + '/api/kc/userinfo?site=' + process.env.SITE_ID,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        }
    )
    //console.log(response)
    return response.data
}

export async function redCreds(username, password = '') {
    const pass = (password !== '') ? ('&password=' + password) : ''
    const response = await axios.post(
        process.env.REDREPORT_URL + '/api/usercheck',
        'username=' + username +
        '&site=' + process.env.SITE_ID +
        pass,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + process.env.REDREPORT_TOKEN,
            }
        }
    )
    return response.data
}

export async function kcExists(username, adminToken) {
    const response = await axios.get(
        process.env.KEYCLOAK_ADMIN_REALM + '/users?exact=true&email=' + username,
        {
            headers: {
                'Authorization': 'Bearer ' + adminToken,
            }
        }
    )
    return response.data
}

export async function registerUser(username, phone, password) {
    try {
        const adminToken = await kcGetAdminToken() //Get Admin token on KC
        const req = await kcExists(username, adminToken)
        if (req.length > 0) {
            console.log('User already exists on KC')
        } else {
            try {
                console.log('Look for user on Red')
                const req = await redCreds(username)
                if (!isNaN(parseFloat(req)) && isFinite(req)) {
                    console.log('User already exists on Red')
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.log('redCreds ' + error.status)
                    if (error.response && error.response.status === 404) {
                        console.log('Let us register user')
                        try {
                            const kc = await kcCreateUser(username, password, adminToken, phone)
                            if (kc === 201) { //Success
                                console.log('User created on KC')
                                //it's enough as Red users are created automatically on successful login via KC
                            }
                        } catch (error) {
                            if (axios.isAxiosError(error)) {
                                console.log('kcCreateUser ' + error.status)
                                console.error(error.response.data)
                            } else {
                                console.error(error)
                            }
                        }
                    }
                    //console.error(error.response)
                } else {
                    console.error(error)
                }
            }
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log('kcExists ' + error.status)
            //console.error(error.response)
        } else {
            console.error(error)
        }
    }
}

export async function kcAddSocial({
                                      email,
                                      provider = 'google',
                                      rep,
                                  }) {
    try {
        const adminToken = await kcGetAdminToken() //Get Admin token on KC
        const req = await kcExists(email, adminToken)
        if (req.length > 0) {
            console.log('User already exists on KC')
            try {
                const response = await axios.post(
                    process.env.KEYCLOAK_ADMIN_REALM + '/users/' +
                    req[0].id + '/federated-identity/' + provider,
                    rep,
                    {
                        headers: {
                            'Authorization': 'Bearer ' + adminToken,
                        }
                    }
                )
                if (response.data === '') return true
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.log('link account ' + error.status)
                    console.error(error.response.data)
                } else {
                    console.error(error)
                }
            }
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log('kcExists ' + error.status)
            //console.error(error.response)
        } else {
            console.error(error)
        }
    }
}

export async function kcEmail({
                                  email,
                                  reason
                              }) {
    try {
        const adminToken = await kcGetAdminToken() //Get Admin token on KC
        const req = await kcExists(email, adminToken)
        if (req.length > 0) {
            console.log('User really exists on KC')
            try {
                const response = await axios.put(
                    process.env.KEYCLOAK_ADMIN_REALM + '/users/' +
                    req[0].id + '/execute-actions-email',
                    [
                        reason
                    ],
                    {
                        headers: {
                            'Authorization': 'Bearer ' + adminToken,
                        }
                    }
                )
                if (response.data === '') return true
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.log('Send restore email ' + error.status)
                    console.error(error.response.data)
                } else {
                    console.error(error)
                }
            }
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log('kcExists ' + error.status)
            //console.error(error.response)
        } else {
            console.error(error)
        }
    }
}