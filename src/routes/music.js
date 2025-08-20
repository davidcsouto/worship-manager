const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
  getMusic, 
  getMusicById, 
  addMusic, 
  updateMusic, 
  deleteMusic 
} = require('../data/database');
const { getMemberById } = require('../data/database');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Music:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da música
 *         name:
 *           type: string
 *           description: Nome da música
 *         key:
 *           type: string
 *           description: Tonalidade da música
 *         versionLink:
 *           type: string
 *           description: Link para versão da música
 *         lyrics:
 *           type: string
 *           description: Letra da música
 *         soloistId:
 *           type: integer
 *           description: ID do solista (membro)
 *         soloist:
 *           type: object
 *           description: Dados do solista
 *     MusicCreate:
 *       type: object
 *       required:
 *         - name
 *         - key
 *         - versionLink
 *         - lyrics
 *         - soloistId
 *       properties:
 *         name:
 *           type: string
 *           description: Nome da música
 *         key:
 *           type: string
 *           description: Tonalidade da música
 *         versionLink:
 *           type: string
 *           description: Link para versão da música
 *         lyrics:
 *           type: string
 *           description: Letra da música
 *         soloistId:
 *           type: integer
 *           description: ID do solista (membro)
 *     MusicUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nome da música
 *         key:
 *           type: string
 *           description: Tonalidade da música
 *         versionLink:
 *           type: string
 *           description: Link para versão da música
 *         lyrics:
 *           type: string
 *           description: Letra da música
 *         soloistId:
 *           type: integer
 *           description: ID do solista (membro)
 */

/**
 * @swagger
 * /music:
 *   get:
 *     summary: Listar todas as músicas
 *     description: Retorna a lista de todas as músicas cadastradas
 *     tags: [Músicas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de músicas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 music:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Music'
 *       401:
 *         description: Não autorizado
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const music = getMusic();
    
    // Adicionar dados do solista para cada música
    const musicWithSoloist = music.map(song => {
      const soloist = getMemberById(song.soloistId);
      return {
        ...song,
        soloist: soloist ? {
          id: soloist.id,
          name: soloist.name,
          voiceType: soloist.voiceType
        } : null
      };
    });

    res.json({ music: musicWithSoloist });
  } catch (error) {
    console.error('Erro ao listar músicas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao listar músicas'
    });
  }
});

/**
 * @swagger
 * /music/{id}:
 *   get:
 *     summary: Buscar música por ID
 *     description: Retorna os dados de uma música específica
 *     tags: [Músicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da música
 *     responses:
 *       200:
 *         description: Música encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Music'
 *       404:
 *         description: Música não encontrada
 *       401:
 *         description: Não autorizado
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const musicId = parseInt(req.params.id);
    const song = getMusicById(musicId);

    if (!song) {
      return res.status(404).json({
        error: 'Música não encontrada',
        message: 'Música com o ID especificado não foi encontrada'
      });
    }

    // Adicionar dados do solista
    const soloist = getMemberById(song.soloistId);
    const songWithSoloist = {
      ...song,
      soloist: soloist ? {
        id: soloist.id,
        name: soloist.name,
        voiceType: soloist.voiceType
      } : null
    };

    res.json(songWithSoloist);
  } catch (error) {
    console.error('Erro ao buscar música:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar música'
    });
  }
});

/**
 * @swagger
 * /music:
 *   post:
 *     summary: Criar nova música (apenas admin)
 *     description: Cria uma nova música no repertório (apenas administradores)
 *     tags: [Músicas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MusicCreate'
 *     responses:
 *       201:
 *         description: Música criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 music:
 *                   $ref: '#/components/schemas/Music'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, key, versionLink, lyrics, soloistId } = req.body;

    // Validação dos campos obrigatórios
    if (!name || !key || !versionLink || !lyrics || !soloistId) {
      return res.status(400).json({
        error: 'Campos obrigatórios',
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Verificar se o solista existe
    const soloist = getMemberById(soloistId);
    if (!soloist) {
      return res.status(400).json({
        error: 'Solista não encontrado',
        message: 'O solista especificado não foi encontrado'
      });
    }

    // Criar nova música
    const newMusic = addMusic({
      name,
      key,
      versionLink,
      lyrics,
      soloistId
    });

    // Adicionar dados do solista na resposta
    const musicWithSoloist = {
      ...newMusic,
      soloist: {
        id: soloist.id,
        name: soloist.name,
        voiceType: soloist.voiceType
      }
    };

    res.status(201).json({
      message: 'Música criada com sucesso',
      music: musicWithSoloist
    });
  } catch (error) {
    console.error('Erro ao criar música:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar música'
    });
  }
});

/**
 * @swagger
 * /music/{id}:
 *   put:
 *     summary: Atualizar música (apenas admin)
 *     description: Atualiza os dados de uma música existente (apenas administradores)
 *     tags: [Músicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da música
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MusicUpdate'
 *     responses:
 *       200:
 *         description: Música atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 music:
 *                   $ref: '#/components/schemas/Music'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Música não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const musicId = parseInt(req.params.id);
    const { name, key, versionLink, lyrics, soloistId } = req.body;

    // Verificar se a música existe
    const existingMusic = getMusicById(musicId);
    if (!existingMusic) {
      return res.status(404).json({
        error: 'Música não encontrada',
        message: 'Música com o ID especificado não foi encontrada'
      });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (name) updateData.name = name;
    if (key) updateData.key = key;
    if (versionLink) updateData.versionLink = versionLink;
    if (lyrics) updateData.lyrics = lyrics;
    if (soloistId) {
      // Verificar se o novo solista existe
      const newSoloist = getMemberById(soloistId);
      if (!newSoloist) {
        return res.status(400).json({
          error: 'Solista não encontrado',
          message: 'O solista especificado não foi encontrado'
        });
      }
      updateData.soloistId = soloistId;
    }

    // Atualizar música
    const updatedMusic = updateMusic(musicId, updateData);

    // Adicionar dados do solista na resposta
    const soloist = getMemberById(updatedMusic.soloistId);
    const musicWithSoloist = {
      ...updatedMusic,
      soloist: soloist ? {
        id: soloist.id,
        name: soloist.name,
        voiceType: soloist.voiceType
      } : null
    };

    res.json({
      message: 'Música atualizada com sucesso',
      music: musicWithSoloist
    });
  } catch (error) {
    console.error('Erro ao atualizar música:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar música'
    });
  }
});

/**
 * @swagger
 * /music/{id}:
 *   delete:
 *     summary: Excluir música (apenas admin)
 *     description: Remove uma música do repertório (apenas administradores)
 *     tags: [Músicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da música
 *     responses:
 *       200:
 *         description: Música excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Música não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const musicId = parseInt(req.params.id);

    // Verificar se a música existe
    const existingMusic = getMusicById(musicId);
    if (!existingMusic) {
      return res.status(404).json({
        error: 'Música não encontrada',
        message: 'Música com o ID especificado não foi encontrada'
      });
    }

    // Excluir música
    const deleted = deleteMusic(musicId);

    if (deleted) {
      res.json({
        message: 'Música excluída com sucesso'
      });
    } else {
      res.status(500).json({
        error: 'Erro ao excluir música',
        message: 'Não foi possível excluir a música'
      });
    }
  } catch (error) {
    console.error('Erro ao excluir música:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao excluir música'
    });
  }
});

module.exports = router;
