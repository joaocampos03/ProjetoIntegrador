const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

class UserController {

  static async cadastrar(req, res) {
    try {
      const {
        nome,
        email,
        senha,
        endereco,
        dataNascimento,
        sexo,
        cpf,
        telefone
      } = req.body;

      if (!nome || !email || !senha || !endereco || !dataNascimento || !sexo || !cpf || !telefone) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos são obrigatórios',
          campos: {
            nome: !nome ? 'obrigatório' : 'ok',
            email: !email ? 'obrigatório' : 'ok',
            senha: !senha ? 'obrigatório' : 'ok',
            endereco: !endereco ? 'obrigatório' : 'ok',
            dataNascimento: !dataNascimento ? 'obrigatório' : 'ok',
            sexo: !sexo ? 'obrigatório' : 'ok',
            cpf: !cpf ? 'obrigatório' : 'ok',
            telefone: !telefone ? 'obrigatório' : 'ok'
          }
        });
      }

      if (nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Nome deve ter pelo menos 3 caracteres'
        });
      }

      if (senha.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Senha deve ter pelo menos 6 caracteres'
        });
      }

      const emailExiste = await prisma.usuario.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (emailExiste) {
        return res.status(409).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }

      const cpfLimpo = cpf.replace(/[^\d]/g, '');
      const cpfExiste = await prisma.usuario.findUnique({
        where: { cpf: cpfLimpo }
      });

      if (cpfExiste) {
        return res.status(409).json({
          success: false,
          message: 'CPF já cadastrado'
        });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const usuario = await prisma.usuario.create({
        data: {
          nome: nome.trim(),
          email: email.toLowerCase(),
          senha: senhaHash,
          endereco: endereco.trim(),
          dataNascimento: new Date(dataNascimento),
          sexo,
          cpf: cpfLimpo,
          telefone: telefone.replace(/\s/g, '')
        }
      });

      const { senha: _, ...usuarioSemSenha } = usuario;

      res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso!',
        data: {
          id: usuarioSemSenha.id,
          nome: usuarioSemSenha.nome,
          email: usuarioSemSenha.email,
          endereco: usuarioSemSenha.endereco,
          dataNascimento: usuarioSemSenha.dataNascimento,
          sexo: usuarioSemSenha.sexo,
          cpf: usuarioSemSenha.cpf,
          telefone: usuarioSemSenha.telefone,
          createdAt: usuarioSemSenha.createdAt
        }
      });

    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar usuário',
        error: error.message
      });
    }
  }

  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          email: true,
          endereco: true,
          dataNascimento: true,
          sexo: true,
          cpf: true,
          telefone: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        data: usuario
      });

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar usuário',
        error: error.message
      });
    }
  }

  static async listar(req, res) {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          cidade: true,
          estado: true,
          sexo: true,
          telefone: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        total: usuarios.length,
        data: usuarios
      });

    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar usuários',
        error: error.message
      });
    }
  }

  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, endereco, telefone } = req.body;

      const usuario = await prisma.usuario.findUnique({
        where: { id }
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const dadosAtualizacao = {};

      if (nome && nome.trim().length >= 3) {
        dadosAtualizacao.nome = nome.trim();
      }

      if (endereco && endereco.trim().length > 0) {
        dadosAtualizacao.endereco = endereco.trim();
      }

      if (telefone && UserController.validarTelefone(telefone)) {
        dadosAtualizacao.telefone = telefone.replace(/\s/g, '');
      }

      const usuarioAtualizado = await prisma.usuario.update({
        where: { id },
        data: dadosAtualizacao,
        select: {
          id: true,
          nome: true,
          email: true,
          endereco: true,
          dataNascimento: true,
          sexo: true,
          cpf: true,
          telefone: true,
          updatedAt: true
        }
      });

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: usuarioAtualizado
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar usuário',
        error: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      const usuario = await prisma.usuario.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        });
      }

      const { senha: _, ...usuarioSemSenha } = usuario;

      res.json({
        success: true,
        message: 'Login realizado com sucesso!',
        data: {
          id: usuarioSemSenha.id,
          nome: usuarioSemSenha.nome,
          email: usuarioSemSenha.email,
          endereco: usuarioSemSenha.endereco,
          dataNascimento: usuarioSemSenha.dataNascimento,
          sexo: usuarioSemSenha.sexo,
          cpf: usuarioSemSenha.cpf,
          telefone: usuarioSemSenha.telefone,
          createdAt: usuarioSemSenha.createdAt,
          updatedAt: usuarioSemSenha.updatedAt
        }
      });

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer login',
        error: error.message
      });
    }
  }
}

module.exports = UserController;