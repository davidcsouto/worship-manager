const request = require('supertest')
const {expect} = require('chai')
require('dotenv/config')
const {getToken} = require('./authentication')
const postAuthLogin = require('../fixtures/postAuthLogin.json')

const createMember = async (bodyMember) => {
            
    const token = await getToken(postAuthLogin)
    const response = await request(process.env.BASE_URL)
        .post('/members')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(bodyMember)
        
    return response
}

const listAllMembers = async () => {
    const token = await getToken(postAuthLogin)

    const response = await request(process.env.BASE_URL)
        .get('/members')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)

    return response
}

const listMemberById = async (idMember) => {
    const token = await getToken(postAuthLogin)

    const response = await request(process.env.BASE_URL)
        .get(`/members/${idMember}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)

    return response
}

const updateDataMember = async (idMember, bodyUpdated) => {
    const token = await getToken(postAuthLogin)

    const response = await request(process.env.BASE_URL)
        .put(`/members/${idMember}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(bodyUpdated)

    return response
}

const deleteMember = async (idMember) => {
    const token = await getToken(postAuthLogin)

    const response = await request(process.env.BASE_URL)
        .delete(`/members/${idMember}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)

    return response
}

const getIdLastMember = async() => {
    const membros = await (await listAllMembers()).body.members
    return membros.length - 1
}

const validateMessage = (response, statusCode, message) => {

    expect(response.status).to.equal(statusCode)
    expect(response.body.message).to.equal(message)

}

module.exports = {
    createMember, listAllMembers, listMemberById, updateDataMember, deleteMember, getIdLastMember, validateMessage
}