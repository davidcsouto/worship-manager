const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
  getScales, 
  getScaleById, 
  addScale, 
  updateScale, 
  deleteScale 
} = require('../data/database');
const { getMusicById, getMemberById } = require('../data/database');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Scale:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da escala
 *         name:
 *           type: string
 *           description: Nome da escala
 *         date:
 *           type: string
 *           format: date
 *           description: Data da escala
 *         songs:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               musicId:
 *                 type: integer
 *               soloistId:
 *                 type: integer
 *               music:
 *                 type: object
 *                 description: Dados da música
 *               soloist:
 *                 type: object
 *                 description: Dados do solista
 *     ScaleCreate:
 *       type: object
 *       required:
 *         - name
 *         - date
 *         - songs
 *       properties:
 *         name:
 *           type: string
 *           description: Nome da escala
 *         date:
 *           type: string
 *           format: date
 *           description: Data da escala
 *         songs:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - musicId
 *               - soloistId
 *             properties:
 *               musicId:
 *                 type: integer
 *                 description: ID da música
 *               soloistId:
 *                 type: integer
 *                 description: ID do solista
 *     ScaleUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nome da escala
 *         date:
 *           type: string
 *           format: date
 *           description: Data da escala
 *         songs:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               musicId:
 *                 type: integer
 *                 description: ID da música
 *               soloistId:
 *                 type: integer
 *                 description: ID do solista
 */

/**
 * @swagger
 * /scales:
 *   get:
 *     summary: Listar todas as escalas
 *     description: Retorna a lista de todas as escalas cadastradas
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de escalas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scales:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Scale'
 *       401:
 *         description: Não autorizado
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const scales = getScales();
    
    // Adicionar dados das músicas e solistas para cada escala
    const scalesWithDetails = scales.map(scale => {
      const songsWithDetails = scale.songs.map(song => {
        const music = getMusicById(song.musicId);
        const soloist = getMemberById(song.soloistId);
        
        return {
          ...song,
          music: music ? {
            id: music.id,
            name: music.name,
            key: music.key,
            versionLink: music.versionLink
          } : null,
          soloist: soloist ? {
            id: soloist.id,
            name: soloist.name,
            voiceType: soloist.voiceType
          } : null
        };
      });

      return {
        ...scale,
        songs: songsWithDetails
      };
    });

    res.json({ scales: scalesWithDetails });
  } catch (error) {
    console.error('Erro ao listar escalas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao listar escalas'
    });
  }
});

/**
 * @swagger
 * /scales/{id}:
 *   get:
 *     summary: Buscar escala por ID
 *     description: Retorna os dados de uma escala específica
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da escala
 *     responses:
 *       200:
 *         description: Escala encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scale'
 *       404:
 *         description: Escala não encontrada
 *       401:
 *         description: Não autorizado
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const scaleId = parseInt(req.params.id);
    const scale = getScaleById(scaleId);

    if (!scale) {
      return res.status(404).json({
        error: 'Escala não encontrada',
        message: 'Escala com o ID especificado não foi encontrada'
      });
    }

    // Adicionar dados das músicas e solistas
    const songsWithDetails = scale.songs.map(song => {
      const music = getMusicById(song.musicId);
      const soloist = getMemberById(song.soloistId);
      
      return {
        ...song,
        music: music ? {
          id: music.id,
          name: music.name,
          key: music.key,
          versionLink: music.versionLink
        } : null,
        soloist: soloist ? {
          id: soloist.id,
          name: soloist.name,
          voiceType: soloist.voiceType
        } : null
      };
    });

    const scaleWithDetails = {
      ...scale,
      songs: songsWithDetails
    };

    res.json(scaleWithDetails);
  } catch (error) {
    console.error('Erro ao buscar escala:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar escala'
    });
  }
});

/**
 * @swagger
 * /scales:
 *   post:
 *     summary: Criar nova escala (apenas admin)
 *     description: Cria uma nova escala (apenas administradores)
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScaleCreate'
 *     responses:
 *       201:
 *         description: Escala criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 scale:
 *                   $ref: '#/components/schemas/Scale'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, date, songs } = req.body;

    // Validação dos campos obrigatórios
    if (!name || !date || !songs || !Array.isArray(songs) || songs.length === 0) {
      return res.status(400).json({
        error: 'Campos obrigatórios',
        message: 'Nome, data e pelo menos uma música são obrigatórios'
      });
    }

    // Validar cada música e solista
    for (const song of songs) {
      if (!song.musicId || !song.soloistId) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'Cada música deve ter musicId e soloistId'
        });
      }

      // Verificar se a música existe
      const music = getMusicById(song.musicId);
      if (!music) {
        return res.status(400).json({
          error: 'Música não encontrada',
          message: `Música com ID ${song.musicId} não foi encontrada`
        });
      }

      // Verificar se o solista existe
      const soloist = getMemberById(song.soloistId);
      if (!soloist) {
        return res.status(400).json({
          error: 'Solista não encontrado',
          message: `Solista com ID ${song.soloistId} não foi encontrado`
        });
      }
    }

    // Criar nova escala
    const newScale = addScale({
      name,
      date,
      songs
    });

    // Adicionar dados das músicas e solistas na resposta
    const songsWithDetails = newScale.songs.map(song => {
      const music = getMusicById(song.musicId);
      const soloist = getMemberById(song.soloistId);
      
      return {
        ...song,
        music: {
          id: music.id,
          name: music.name,
          key: music.key,
          versionLink: music.versionLink
        },
        soloist: {
          id: soloist.id,
          name: soloist.name,
          voiceType: soloist.voiceType
        }
      };
    });

    const scaleWithDetails = {
      ...newScale,
      songs: songsWithDetails
    };

    res.status(201).json({
      message: 'Escala criada com sucesso',
      scale: scaleWithDetails
    });
  } catch (error) {
    console.error('Erro ao criar escala:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar escala'
    });
  }
});

/**
 * @swagger
 * /scales/{id}:
 *   put:
 *     summary: Atualizar escala (apenas admin)
 *     description: Atualiza os dados de uma escala existente (apenas administradores)
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da escala
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScaleUpdate'
 *     responses:
 *       200:
 *         description: Escala atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 scale:
 *                   $ref: '#/components/schemas/Scale'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Escala não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const scaleId = parseInt(req.params.id);
    const { name, date, songs } = req.body;

    // Verificar se a escala existe
    const existingScale = getScaleById(scaleId);
    if (!existingScale) {
      return res.status(404).json({
        error: 'Escala não encontrada',
        message: 'Escala com o ID especificado não foi encontrada'
      });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (name) updateData.name = name;
    if (date) updateData.date = date;
    if (songs) {
      // Validar as novas músicas
      if (!Array.isArray(songs) || songs.length === 0) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'A lista de músicas deve ser um array não vazio'
        });
      }

      for (const song of songs) {
        if (!song.musicId || !song.soloistId) {
          return res.status(400).json({
            error: 'Dados inválidos',
            message: 'Cada música deve ter musicId e soloistId'
          });
        }

        // Verificar se a música existe
        const music = getMusicById(song.musicId);
        if (!music) {
          return res.status(400).json({
            error: 'Música não encontrada',
            message: `Música com ID ${song.musicId} não foi encontrada`
          });
        }

        // Verificar se o solista existe
        const soloist = getMemberById(song.soloistId);
        if (!soloist) {
          return res.status(400).json({
            error: 'Solista não encontrado',
            message: `Solista com ID ${song.soloistId} não foi encontrado`
          });
        }
      }

      updateData.songs = songs;
    }

    // Atualizar escala
    const updatedScale = updateScale(scaleId, updateData);

    // Adicionar dados das músicas e solistas na resposta
    const songsWithDetails = updatedScale.songs.map(song => {
      const music = getMusicById(song.musicId);
      const soloist = getMemberById(song.soloistId);
      
      return {
        ...song,
        music: {
          id: music.id,
          name: music.name,
          key: music.key,
          versionLink: music.versionLink
        },
        soloist: {
          id: soloist.id,
          name: soloist.name,
          voiceType: soloist.voiceType
        }
      };
    });

    const scaleWithDetails = {
      ...updatedScale,
      songs: songsWithDetails
    };

    res.json({
      message: 'Escala atualizada com sucesso',
      scale: scaleWithDetails
    });
  } catch (error) {
    console.error('Erro ao atualizar escala:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar escala'
    });
  }
});

/**
 * @swagger
 * /scales/{id}:
 *   delete:
 *     summary: Excluir escala (apenas admin)
 *     description: Remove uma escala (apenas administradores)
 *     tags: [Escalas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da escala
 *     responses:
 *       200:
 *         description: Escala excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Escala não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const scaleId = parseInt(req.params.id);

    // Verificar se a escala existe
    const existingScale = getScaleById(scaleId);
    if (!existingScale) {
      return res.status(404).json({
        error: 'Escala não encontrada',
        message: 'Escala com o ID especificado não foi encontrada'
      });
    }

    // Excluir escala
    const deleted = deleteScale(scaleId);

    if (deleted) {
      res.json({
        message: 'Escala excluída com sucesso'
      });
    } else {
      res.status(500).json({
        error: 'Erro ao excluir escala',
        message: 'Não foi possível excluir a escala'
      });
    }
  } catch (error) {
    console.error('Erro ao excluir escala:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao excluir escala'
    });
  }
});

module.exports = router;
