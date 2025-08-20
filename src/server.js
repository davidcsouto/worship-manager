const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const musicRoutes = require('./routes/music');
const scaleRoutes = require('./routes/scales');
const { seedDatabase } = require('./data/seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requests por IP
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json());

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Worship Management API',
      version: '1.0.0',
      description: 'API para gerenciamento de ministérios de adoração com autenticação JWT e controle de acesso',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);

// Rotas
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/auth', authRoutes);
app.use('/members', memberRoutes);
app.use('/music', musicRoutes);
app.use('/scales', scaleRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'Banda API - Sistema de Gerenciamento de Banda',
    version: '1.0.0',
    documentation: `/api-docs`
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    message: 'A rota solicitada não existe' 
  });
});

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação disponível em: http://localhost:${PORT}/api-docs`);
  
  // Popular banco de dados com dados iniciais
  try {
    await seedDatabase();
  } catch (error) {
    console.error('Erro ao popular banco de dados:', error);
  }
});
