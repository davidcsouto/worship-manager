const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-jwt-super-segura';

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token não fornecido',
      message: 'Token de autenticação é obrigatório' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Token inválido',
        message: 'Token de autenticação é inválido ou expirado' 
      });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar se o usuário é administrador
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Usuário não autenticado',
      message: 'Autenticação é obrigatória' 
    });
  }

  if (req.user.accessLevel !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso negado',
      message: 'Apenas administradores podem realizar esta operação' 
    });
  }

  next();
};

// Função para gerar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      accessLevel: user.accessLevel 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Função para autenticar usuário
const authenticateUser = async (email, password) => {
  const { getMembers } = require('../data/database');
  const user = getMembers().find(member => member.email === email);
  
  if (!user) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return null;
  }

  return user;
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken,
  authenticateUser
};
