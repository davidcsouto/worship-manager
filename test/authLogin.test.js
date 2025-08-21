const {expect} = require('chai')

const postAuthLogin = require('./fixtures/postAuthLogin.json')
const {authLoginWith} = require('./helpers/authentication')

describe('Authentication/Login', () => {

        describe('POST /auth/login', ()=> {
            
            it('Should allow login with valid credentials and return status 200', async () => {
                const response = await authLoginWith(postAuthLogin)

                expect(response.status).to.equal(200)
                expect(response.body.token).to.not.be.empty       
            })
    })
})