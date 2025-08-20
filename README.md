# Worship Manager - Sistema de Gerenciamento de Ministério de Louvor

Uma API RESTful em Node.js para gerenciamento de ministério de louvor com autenticação JWT e controle de acesso por níveis.

## 🎯 Funcionalidades

### Autenticação e Autorização
- **RF01**: Autenticação com Token JWT
- **RF02**: Gerenciamento de Níveis de Acesso (Admin/Common)

### Gerenciamento de Membros
- **RF03**: Criar Membro
- **RF04**: Atualizar Membro
- **RF05**: Categorização por Tipo de Voz/Instrumento
- **RF06**: Restrição de Gerenciamento (apenas Admin)

### Gerenciamento de Músicas
- **RF07**: CRUD completo de músicas
- **RF08**: Campos: Nome, Tonalidade, Link de versão, Letra e Solista

### Gerenciamento de Escalas
- **RF09**: Criar Escala
- **RF10**: Listar Escalas
- **RF11**: Atualizar Escala
- **RF12**: Excluir Escala

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **JWT** - Autenticação por token
- **bcryptjs** - Criptografia de senhas
- **Swagger** - Documentação da API
- **Helmet** - Segurança
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Proteção contra ataques

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd worship-manager
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📚 Documentação da API

A documentação interativa está disponível em:
```
http://localhost:3000/api-docs
```

## 🔐 Autenticação

A API utiliza autenticação JWT. Para acessar endpoints protegidos, inclua o token no header:

```
Authorization: Bearer <seu-token-jwt>
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "joao@banda.com",
  "password": "123456"
}
```

## 👥 Usuários Padrão

O sistema é populado automaticamente com os seguintes usuários:

### Administrador
- **Email**: joao@banda.com
- **Senha**: 123456
- **Nível**: admin
- **Tipo de Voz**: Tenor

### Membros Comuns
- **Email**: maria@banda.com
- **Senha**: 123456
- **Nível**: common
- **Tipo de Voz**: Soprano

- **Email**: pedro@banda.com
- **Senha**: 123456
- **Nível**: common
- **Tipo de Voz**: Barítono

- **Email**: ana@banda.com
- **Senha**: 123456
- **Nível**: common
- **Tipo de Voz**: Contralto

- **Email**: carlos@banda.com
- **Senha**: 123456
- **Nível**: common
- **Tipo de Voz**: Baixo

## 🎵 Músicas Padrão

O sistema inclui 5 músicas pré-cadastradas:
1. Amazing Grace (C) - Solista: João Silva
2. How Great Thou Art (G) - Solista: Maria Santos
3. It Is Well With My Soul (D) - Solista: Pedro Costa
4. Great Is Thy Faithfulness (F) - Solista: Ana Oliveira
5. Be Thou My Vision (A) - Solista: Carlos Lima

## 📡 Endpoints da API

### Autenticação
- `POST /auth/login` - Login de usuário

### Membros
- `GET /members` - Listar todos os membros
- `GET /members/:id` - Buscar membro por ID
- `POST /members` - Criar novo membro (Admin)
- `PUT /members/:id` - Atualizar membro (Admin)
- `DELETE /members/:id` - Excluir membro (Admin)

### Músicas
- `GET /music` - Listar todas as músicas
- `GET /music/:id` - Buscar música por ID
- `POST /music` - Criar nova música (Admin)
- `PUT /music/:id` - Atualizar música (Admin)
- `DELETE /music/:id` - Excluir música (Admin)

### Escalas
- `GET /scales` - Listar todas as escalas
- `GET /scales/:id` - Buscar escala por ID
- `POST /scales` - Criar nova escala (Admin)
- `PUT /scales/:id` - Atualizar escala (Admin)
- `DELETE /scales/:id` - Excluir escala (Admin)

## 🔒 Controle de Acesso

### Níveis de Acesso
- **Admin**: Acesso total a todas as funcionalidades
- **Common**: Acesso apenas para visualização

### Operações Restritas (Apenas Admin)
- Criar, editar e excluir membros
- Criar, editar e excluir músicas
- Criar, editar e excluir escalas
- Alterar níveis de acesso

## 🗄️ Armazenamento

A API utiliza armazenamento em memória (sem banco de dados), conforme especificado nos requisitos. Os dados são perdidos quando o servidor é reiniciado.

## 🛡️ Segurança

- **JWT**: Autenticação segura com tokens
- **bcrypt**: Senhas criptografadas
- **Helmet**: Headers de segurança
- **Rate Limiting**: Proteção contra ataques de força bruta
- **CORS**: Configuração de cross-origin
- **Validação**: Validação de dados de entrada

## 📝 Exemplos de Uso

### Criar uma Escala
```bash
POST /scales
Authorization: Bearer <token-admin>
Content-Type: application/json

{
  "name": "Escala de Domingo",
  "date": "2024-01-15",
  "songs": [
    {
      "musicId": 1,
      "soloistId": 1
    },
    {
      "musicId": 2,
      "soloistId": 2
    }
  ]
}
```

### Atualizar Nível de Acesso
```bash
PUT /members/2
Authorization: Bearer <token-admin>
Content-Type: application/json

{
  "accessLevel": "admin"
}
```

## 🐛 Tratamento de Erros

A API retorna códigos de status HTTP apropriados:

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvimento

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através dos canais disponíveis.
