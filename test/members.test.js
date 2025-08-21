const {v4: uuidv4} = require('uuid')
const {expect} = require('chai')
const {createMember, listAllMembers, listMemberById, updateDataMember, deleteMember, getIdLastMember, validateMessage} = require('./helpers/member')
const postMember = require('./fixtures/postMember.json')
const putDataMember = require('./fixtures/putDataMember.json')

describe('Membros', () => {
    describe('POST /membros', ()=> {
        it('Should allow to create a admin member', async ()=>{
            //Arrange
            postMember.email = `${uuidv4()}@cpredondo.com`
            postMember.accessLevel = 'admin'

            //Act
            const response = await createMember(postMember)
            
            //Assert
            validateMessage(response, 201, 'Membro criado com sucesso')            
        })

        it('Should allow to create a common member', async ()=> {
            //Arrange
            postMember.email = `${uuidv4()}@cpredondo.com`
            postMember.accessLevel = 'common'

            //Act
            const response = await createMember(postMember)

             //Assert
            validateMessage(response, 201, 'Membro criado com sucesso')   
        })
    })

    describe('GET /membros', () => {
        it('Should list all members registered', async ()=> {
            //Act
            const response = await listAllMembers()

            //Assert
            expect(response.status).to.equal(200)
            expect(response.body.members.length >= 5).equal(true) // by default, API initialize with 5 members
        })

        it('Should list a member by ID', async ()=> {
            //Act
            const response = await listMemberById(3)

            //Assert
            expect(response.status).to.equal(200)
            expect(response.body.name).to.not.be.empty
            expect(response.body.voiceType).to.not.be.empty
            expect(response.body.email).to.not.be.empty
            expect(response.body.accessLevel).to.not.be.empty
        })
    })

    describe('PUT /membros', () => {
        it(`Should update all member data`, async ()=> {
            //Arrange
            putDataMember.email = `${uuidv4()}@cpredondo.com`

            //Act
            const response = await updateDataMember(2, putDataMember)

            //Assert
            validateMessage(response, 200, 'Membro atualizado com sucesso')
        })

        it(`Should update one data of member`, async ()=> {
            //Arrange
            const email = JSON.stringify({email: `${uuidv4()}@cpredondo.com`})

            //Act
            const response = await updateDataMember(2, email)

            //Assert
            validateMessage(response, 200, 'Membro atualizado com sucesso')

        })
    })

    describe('DELETE /membros', () => {
        it('Should delete a member by ID', async ()=> {
            // Arrange
            postMember.email = `${uuidv4()}@cpredondo.com`
            const responseCreateMember = await createMember(postMember)
            const membroId =  responseCreateMember.body.member.id

            // Act
            const response = await deleteMember(membroId)

            // Assert
            validateMessage(response, 200, 'Membro excluído com sucesso')
        })
    })
})