const request = require('supertest')
require('dotenv/config')

const authLoginWith = async (authLoginBody) => {

    const responseAuth = await request(process.env.BASE_URL)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send(authLoginBody)
    return responseAuth
}

const getToken = async (authLoginBody) => {

    const response = await authLoginWith(authLoginBody)
    return response.body.token

}

module.exports = {
    authLoginWith, getToken
}