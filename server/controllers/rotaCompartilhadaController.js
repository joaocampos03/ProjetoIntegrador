const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function gerarCodigoUnico() {
  return crypto.randomBytes(6).toString('hex');
}

class RotaCompartilhadaController {

  static async compartilhar(req, res) {
    try {
      const { rotaSalvaId, publica = false, diasExpiracao } = req.body;

      if (!rotaSalvaId) {
        return res.status(400).json({
          success: false,
          message: 'ID da rota salva é obrigatório'
        });
      }

      const rotaSalva = await prisma.rotaSalva.findUnique({
        where: { id: rotaSalvaId },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      });

      if (!rotaSalva) {
        return res.status(404).json({
          success: false,
          message: 'Rota salva não encontrada'
        });
      }

      const compartilhamentoExistente = await prisma.rotaCompartilhada.findFirst({
        where: {
          rotaSalvaId,
          ativa: true
        }
      });

      if (compartilhamentoExistente) {
        return res.json({
          success: true,
          message: 'Link de compartilhamento já existe',
          data: {
            codigo: compartilhamentoExistente.codigo,
            link: `/rota/${compartilhamentoExistente.codigo}`,
            publica: compartilhamentoExistente.publica,
            visualizacoes: compartilhamentoExistente.visualizacoes,
            expiraEm: compartilhamentoExistente.expiraEm,
            createdAt: compartilhamentoExistente.createdAt
          }
        });
      }

      let codigo = gerarCodigoUnico();
      
      let tentativas = 0;
      while (tentativas < 10) {
        const existe = await prisma.rotaCompartilhada.findUnique({
          where: { codigo }
        });
        if (!existe) break;
        codigo = gerarCodigoUnico();
        tentativas++;
      }

      let expiraEm = null;
      if (diasExpiracao && diasExpiracao > 0) {
        expiraEm = new Date();
        expiraEm.setDate(expiraEm.getDate() + diasExpiracao);
      }

      const compartilhamento = await prisma.rotaCompartilhada.create({
        data: {
          codigo,
          rotaSalvaId,
          publica,
          expiraEm
        }
      });

      res.status(201).json({
        success: true,
        message: 'Link de compartilhamento criado com sucesso!',
        data: {
          codigo: compartilhamento.codigo,
          link: `/rota/${compartilhamento.codigo}`,
          publica: compartilhamento.publica,
          expiraEm: compartilhamento.expiraEm,
          createdAt: compartilhamento.createdAt
        }
      });

    } catch (error) {
      console.error('Erro ao compartilhar rota:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao compartilhar rota',
        error: error.message
      });
    }
  }

  static async buscarPorCodigo(req, res) {
    try {
      const { codigo } = req.params;

      const compartilhamento = await prisma.rotaCompartilhada.findUnique({
        where: { codigo },
        include: {
          rotaSalva: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true
                }
              }
            }
          }
        }
      });

      if (!compartilhamento) {
        return res.status(404).json({
          success: false,
          message: 'Rota compartilhada não encontrada'
        });
      }

      if (!compartilhamento.ativa) {
        return res.status(410).json({
          success: false,
          message: 'Este link de compartilhamento foi desativado'
        });
      }

      if (compartilhamento.expiraEm && new Date() > compartilhamento.expiraEm) {
        return res.status(410).json({
          success: false,
          message: 'Este link de compartilhamento expirou'
        });
      }

      await prisma.rotaCompartilhada.update({
        where: { codigo },
        data: {
          visualizacoes: {
            increment: 1
          }
        }
      });

      const rotaSalva = compartilhamento.rotaSalva;

      res.json({
        success: true,
        data: {
          compartilhamento: {
            codigo: compartilhamento.codigo,
            publica: compartilhamento.publica,
            visualizacoes: compartilhamento.visualizacoes + 1,
            createdAt: compartilhamento.createdAt
          },
          rota: {
            id: rotaSalva.id,
            nome: rotaSalva.nome,
            descricao: rotaSalva.descricao,
            preco: rotaSalva.preco,
            aeroportos: rotaSalva.aeroportos,
            detalhesAeroportos: rotaSalva.detalhesAeroportos,
            createdAt: rotaSalva.createdAt
          },
          criadoPor: {
            id: rotaSalva.usuario.id,
            nome: rotaSalva.usuario.nome
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar rota compartilhada:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar rota compartilhada',
        error: error.message
      });
    }
  }

  static async desativar(req, res) {
    try {
      const { codigo } = req.params;
      const { usuarioId } = req.body;

      const compartilhamento = await prisma.rotaCompartilhada.findUnique({
        where: { codigo },
        include: {
          rotaSalva: {
            select: {
              usuarioId: true
            }
          }
        }
      });

      if (!compartilhamento) {
        return res.status(404).json({
          success: false,
          message: 'Compartilhamento não encontrado'
        });
      }

      if (usuarioId && compartilhamento.rotaSalva.usuarioId !== usuarioId) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para desativar este compartilhamento'
        });
      }

      await prisma.rotaCompartilhada.update({
        where: { codigo },
        data: { ativa: false }
      });

      res.json({
        success: true,
        message: 'Compartilhamento desativado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao desativar compartilhamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao desativar compartilhamento',
        error: error.message
      });
    }
  }

  static async listarPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;

      const compartilhamentos = await prisma.rotaCompartilhada.findMany({
        where: {
          rotaSalva: {
            usuarioId
          },
          ativa: true
        },
        include: {
          rotaSalva: {
            select: {
              id: true,
              nome: true,
              aeroportos: true,
              preco: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        total: compartilhamentos.length,
        data: compartilhamentos.map(c => ({
          codigo: c.codigo,
          link: `/rota/${c.codigo}`,
          publica: c.publica,
          visualizacoes: c.visualizacoes,
          expiraEm: c.expiraEm,
          createdAt: c.createdAt,
          rota: c.rotaSalva
        }))
      });

    } catch (error) {
      console.error('Erro ao listar compartilhamentos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar compartilhamentos',
        error: error.message
      });
    }
  }

  static async listarPublicas(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const [compartilhamentos, total] = await Promise.all([
        prisma.rotaCompartilhada.findMany({
          where: {
            publica: true,
            ativa: true,
            OR: [
              { expiraEm: null },
              { expiraEm: { gt: new Date() } }
            ]
          },
          include: {
            rotaSalva: {
              select: {
                id: true,
                nome: true,
                descricao: true,
                aeroportos: true,
                detalhesAeroportos: true,
                preco: true,
                createdAt: true,
                usuario: {
                  select: {
                    nome: true
                  }
                }
              }
            }
          },
          orderBy: {
            visualizacoes: 'desc'
          },
          skip: parseInt(skip),
          take: parseInt(limit)
        }),
        prisma.rotaCompartilhada.count({
          where: {
            publica: true,
            ativa: true,
            OR: [
              { expiraEm: null },
              { expiraEm: { gt: new Date() } }
            ]
          }
        })
      ]);

      res.json({
        success: true,
        total,
        pagina: parseInt(page),
        totalPaginas: Math.ceil(total / limit),
        data: compartilhamentos.map(c => ({
          codigo: c.codigo,
          link: `/rota/${c.codigo}`,
          visualizacoes: c.visualizacoes,
          rota: {
            nome: c.rotaSalva.nome,
            descricao: c.rotaSalva.descricao,
            aeroportos: c.rotaSalva.aeroportos,
            detalhesAeroportos: c.rotaSalva.detalhesAeroportos,
            preco: c.rotaSalva.preco,
            criadoPor: c.rotaSalva.usuario.nome,
            createdAt: c.rotaSalva.createdAt
          }
        }))
      });

    } catch (error) {
      console.error('Erro ao listar rotas públicas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar rotas públicas',
        error: error.message
      });
    }
  }

  static async salvarComoMinha(req, res) {
    try {
      const { codigo, usuarioId, nome, descricao } = req.body;

      if (!codigo || !usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'Código da rota compartilhada e ID do usuário são obrigatórios'
        });
      }

      const compartilhamento = await prisma.rotaCompartilhada.findUnique({
        where: { codigo },
        include: {
          rotaSalva: true
        }
      });

      if (!compartilhamento) {
        return res.status(404).json({
          success: false,
          message: 'Rota compartilhada não encontrada'
        });
      }

      if (!compartilhamento.ativa) {
        return res.status(410).json({
          success: false,
          message: 'Este link de compartilhamento foi desativado'
        });
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId }
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const rotaOriginal = compartilhamento.rotaSalva;

      const novaRota = await prisma.rotaSalva.create({
        data: {
          usuarioId,
          nome: nome || `${rotaOriginal.nome} (copiada)`,
          descricao: descricao || rotaOriginal.descricao,
          preco: rotaOriginal.preco,
          aeroportos: rotaOriginal.aeroportos,
          detalhesAeroportos: rotaOriginal.detalhesAeroportos,
          ativa: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'Rota salva com sucesso na sua conta!',
        data: novaRota
      });

    } catch (error) {
      console.error('Erro ao salvar rota compartilhada:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar rota compartilhada',
        error: error.message
      });
    }
  }

  static async atualizar(req, res) {
    try {
      const { codigo } = req.params;
      const { publica, diasExpiracao, usuarioId } = req.body;

      const compartilhamento = await prisma.rotaCompartilhada.findUnique({
        where: { codigo },
        include: {
          rotaSalva: {
            select: {
              usuarioId: true
            }
          }
        }
      });

      if (!compartilhamento) {
        return res.status(404).json({
          success: false,
          message: 'Compartilhamento não encontrado'
        });
      }

      if (usuarioId && compartilhamento.rotaSalva.usuarioId !== usuarioId) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para editar este compartilhamento'
        });
      }

      const dadosAtualizacao = {};

      if (publica !== undefined) {
        dadosAtualizacao.publica = publica;
      }

      if (diasExpiracao !== undefined) {
        if (diasExpiracao === null || diasExpiracao === 0) {
          dadosAtualizacao.expiraEm = null;
        } else {
          const novaExpiracao = new Date();
          novaExpiracao.setDate(novaExpiracao.getDate() + diasExpiracao);
          dadosAtualizacao.expiraEm = novaExpiracao;
        }
      }

      const compartilhamentoAtualizado = await prisma.rotaCompartilhada.update({
        where: { codigo },
        data: dadosAtualizacao
      });

      res.json({
        success: true,
        message: 'Compartilhamento atualizado com sucesso',
        data: {
          codigo: compartilhamentoAtualizado.codigo,
          publica: compartilhamentoAtualizado.publica,
          expiraEm: compartilhamentoAtualizado.expiraEm
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar compartilhamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar compartilhamento',
        error: error.message
      });
    }
  }
}

module.exports = RotaCompartilhadaController;
