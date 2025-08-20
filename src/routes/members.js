const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
  getMembers, 
  getMemberById, 
  addMember, 
  updateMember, 
  deleteMember 
} = require('../data/database');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Member:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do membro
 *         name:
 *           type: string
 *           description: Nome completo do membro
 *         email:
 *           type: string
 *           format: email
 *           description: Email do membro
 *         voiceType:
 *           type: string
 *           description: Tipo de voz ou instrumento
 *         accessLevel:
 *           type: string
 *           enum: [admin, common]
 *           description: Nível de acesso do membro
 *     MemberCreate:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - voiceType
 *         - accessLevel
 *       properties:
 *         name:
 *           type: string
 *           description: Nome completo do membro
 *         email:
 *           type: string
 *           format: email
 *           description: Email do membro
 *         password:
 *           type: string
 *           description: Senha do membro
 *         voiceType:
 *           type: string
 *           description: Tipo de voz ou instrumento
 *         accessLevel:
 *           type: string
 *           enum: [admin, common]
 *           description: Nível de acesso do membro
 *     MemberUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nome completo do membro
 *         email:
 *           type: string
 *           format: email
 *           description: Email do membro
 *         password:
 *           type: string
 *           description: Nova senha do membro
 *         voiceType:
 *           type: string
 *           description: Tipo de voz ou instrumento
 *         accessLevel:
 *           type: string
 *           enum: [admin, common]
 *           description: Nível de acesso do membro
 */

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Listar todos os membros
 *     description: Retorna a lista de todos os membros da do ministério de louvor
 *     tags: [Membros]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de membros retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Member'
 *       401:
 *         description: Não autorizado
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const members = getMembers();
    
    // Remover senhas dos membros
    const membersWithoutPasswords = members.map(member => {
      const { password, ...memberWithoutPassword } = member;
      return memberWithoutPassword;
    });

    res.json({ members: membersWithoutPasswords });
  } catch (error) {
    console.error('Erro ao listar membros:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao listar membros'
    });
  }
});

/**
 * @swagger
 * /members/{id}:
 *   get:
 *     summary: Buscar membro por ID
 *     description: Retorna os dados de um membro específico
 *     tags: [Membros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do membro
 *     responses:
 *       200:
 *         description: Membro encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       404:
 *         description: Membro não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const member = getMemberById(memberId);

    if (!member) {
      return res.status(404).json({
        error: 'Membro não encontrado',
        message: 'Membro com o ID especificado não foi encontrado'
      });
    }

    // Remover senha do membro
    const { password, ...memberWithoutPassword } = member;

    res.json(memberWithoutPassword);
  } catch (error) {
    console.error('Erro ao buscar membro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar membro'
    });
  }
});

/**
 * @swagger
 * /members:
 *   post:
 *     summary: Criar novo membro (apenas admin)
 *     description: Cria um novo membro no ministério de louvor (apenas administradores)
 *     tags: [Membros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemberCreate'
 *     responses:
 *       201:
 *         description: Membro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 member:
 *                   $ref: '#/components/schemas/Member'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, voiceType, accessLevel } = req.body;

    // Validação dos campos obrigatórios
    if (!name || !email || !password || !voiceType || !accessLevel) {
      return res.status(400).json({
        error: 'Campos obrigatórios',
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Verificar se o email já existe
    const existingMember = getMembers().find(member => member.email === email);
    if (existingMember) {
      return res.status(400).json({
        error: 'Email já cadastrado',
        message: 'Já existe um membro com este email'
      });
    }

    // Validar nível de acesso
    if (!['admin', 'common'].includes(accessLevel)) {
      return res.status(400).json({
        error: 'Nível de acesso inválido',
        message: 'Nível de acesso deve ser "admin" ou "common"'
      });
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar novo membro
    const newMember = addMember({
      name,
      email,
      password: hashedPassword,
      voiceType,
      accessLevel
    });

    // Retornar resposta sem a senha
    const { password: _, ...memberWithoutPassword } = newMember;

    res.status(201).json({
      message: 'Membro criado com sucesso',
      member: memberWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao criar membro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar membro'
    });
  }
});

/**
 * @swagger
 * /members/{id}:
 *   put:
 *     summary: Atualizar membro (apenas admin)
 *     description: Atualiza os dados de um membro existente (apenas administradores)
 *     tags: [Membros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do membro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemberUpdate'
 *     responses:
 *       200:
 *         description: Membro atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 member:
 *                   $ref: '#/components/schemas/Member'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Membro não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const { name, email, password, voiceType, accessLevel } = req.body;

    // Verificar se o membro existe
    const existingMember = getMemberById(memberId);
    if (!existingMember) {
      return res.status(404).json({
        error: 'Membro não encontrado',
        message: 'Membro com o ID especificado não foi encontrado'
      });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (voiceType) updateData.voiceType = voiceType;
    if (accessLevel) {
      if (!['admin', 'common'].includes(accessLevel)) {
        return res.status(400).json({
          error: 'Nível de acesso inválido',
          message: 'Nível de acesso deve ser "admin" ou "common"'
        });
      }
      updateData.accessLevel = accessLevel;
    }

    // Se uma nova senha foi fornecida, criptografá-la
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Verificar se o email já existe (se foi alterado)
    if (email && email !== existingMember.email) {
      const memberWithEmail = getMembers().find(member => member.email === email);
      if (memberWithEmail) {
        return res.status(400).json({
          error: 'Email já cadastrado',
          message: 'Já existe um membro com este email'
        });
      }
    }

    // Atualizar membro
    const updatedMember = updateMember(memberId, updateData);

    // Retornar resposta sem a senha
    const { password: _, ...memberWithoutPassword } = updatedMember;

    res.json({
      message: 'Membro atualizado com sucesso',
      member: memberWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar membro'
    });
  }
});

/**
 * @swagger
 * /members/{id}:
 *   delete:
 *     summary: Excluir membro (apenas admin)
 *     description: Remove um membro do ministério de louvor (apenas administradores)
 *     tags: [Membros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do membro
 *     responses:
 *       200:
 *         description: Membro excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Membro não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const memberId = parseInt(req.params.id);

    // Verificar se o membro existe
    const existingMember = getMemberById(memberId);
    if (!existingMember) {
      return res.status(404).json({
        error: 'Membro não encontrado',
        message: 'Membro com o ID especificado não foi encontrado'
      });
    }

    // Excluir membro
    const deleted = deleteMember(memberId);

    if (deleted) {
      res.json({
        message: 'Membro excluído com sucesso'
      });
    } else {
      res.status(500).json({
        error: 'Erro ao excluir membro',
        message: 'Não foi possível excluir o membro'
      });
    }
  } catch (error) {
    console.error('Erro ao excluir membro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao excluir membro'
    });
  }
});

module.exports = router;
