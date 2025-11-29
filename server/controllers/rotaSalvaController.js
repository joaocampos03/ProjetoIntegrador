const { PrismaClient } = require('@prisma/client');
const grafoService = require('../services/grafoService');

const prisma = new PrismaClient();

class RotaSalvaController {

  static async salvar(req, res) {
    try {
      const { usuarioId, nome, descricao, aeroportos } = req.body;

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório'
        });
      }

      if (!nome || nome.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nome da rota é obrigatório'
        });
      }

      if (!aeroportos || !Array.isArray(aeroportos) || aeroportos.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'É necessário selecionar pelo menos 2 aeroportos'
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

      const detalhesAeroportos = [];
      const trechos = [];
      let precoTotal = 0;

      for (let i = 0; i < aeroportos.length; i++) {
        const codigo = aeroportos[i];
        const aeroporto = await prisma.aeroporto.findUnique({
          where: { codigo: codigo.toUpperCase() },
          select: {
            codigo: true,
            nome: true,
            cidade: true,
            estado: true,
            imagemUrl: true
          }
        });

        if (!aeroporto) {
          return res.status(404).json({
            success: false,
            message: `Aeroporto ${codigo} não encontrado`
          });
        }

        detalhesAeroportos.push(aeroporto);

        // Se não é o último aeroporto, buscar o trecho para o próximo
        if (i < aeroportos.length - 1) {
          const origem = codigo.toUpperCase();
          const destino = aeroportos[i + 1].toUpperCase();

          // Buscar rota entre origem e destino
          const rota = await prisma.rota.findFirst({
            where: {
              codigoOrigem: origem,
              codigoDestino: destino
            }
          });

          if (!rota) {
            // Se não existe voo direto, buscar rota com escalas usando o grafo
            const rotaAlternativa = grafoService.encontrarRotaMaisCurta(origem, destino);
            
            if (!rotaAlternativa || rotaAlternativa.length === 0) {
              return res.status(404).json({
                success: false,
                message: `Não existe nenhuma rota possível de ${origem} para ${destino}. Tente selecionar aeroportos com conexões diretas.`
              });
            }

            // Se encontrou rota alternativa, sugerir ao usuário
            return res.status(400).json({
              success: false,
              message: `Não existe voo direto de ${origem} para ${destino}`,
              sugestao: {
                message: `Existe uma rota alternativa com ${rotaAlternativa.length - 2} escala(s)`,
                rotaSugerida: rotaAlternativa,
                dica: `Tente adicionar aeroportos intermediários: ${rotaAlternativa.join(' → ')}`
              }
            });
          }

          trechos.push({
            origem: origem,
            destino: destino,
            preco: rota.preco,
            frequenciaSemanal: rota.frequenciaSemanal
          });

          precoTotal += rota.preco;
        }
      }

      const rotaSalva = await prisma.rotaSalva.create({
        data: {
          usuarioId,
          nome: nome.trim(),
          descricao: descricao ? descricao.trim() : null,
          preco: precoTotal,
          aeroportos: aeroportos.map(a => a.toUpperCase()),
          detalhesAeroportos: detalhesAeroportos,
          ativa: true
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Rota salva com sucesso!',
        data: {
          ...rotaSalva,
          trechos: trechos,
          resumo: {
            totalAeroportos: aeroportos.length,
            totalTrechos: trechos.length,
            precoTotal: precoTotal
          }
        }
      });

    } catch (error) {
      console.error('Erro ao salvar rota:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar rota',
        error: error.message
      });
    }
  }

  static async listarPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;

      const rotas = await prisma.rotaSalva.findMany({
        where: { 
          usuarioId,
          ativa: true 
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        total: rotas.length,
        data: rotas
      });

    } catch (error) {
      console.error('Erro ao listar rotas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar rotas',
        error: error.message
      });
    }
  }

  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const rota = await prisma.rotaSalva.findUnique({
        where: { id },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        }
      });

      if (!rota) {
        return res.status(404).json({
          success: false,
          message: 'Rota não encontrada'
        });
      }

      res.json({
        success: true,
        data: rota
      });

    } catch (error) {
      console.error('Erro ao buscar rota:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar rota',
        error: error.message
      });
    }
  }

  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, aeroportos } = req.body;

      const rotaExistente = await prisma.rotaSalva.findUnique({
        where: { id }
      });

      if (!rotaExistente) {
        return res.status(404).json({
          success: false,
          message: 'Rota não encontrada'
        });
      }

      const dadosAtualizacao = {};

      if (nome && nome.trim().length > 0) {
        dadosAtualizacao.nome = nome.trim();
      }

      if (descricao !== undefined) {
        dadosAtualizacao.descricao = descricao ? descricao.trim() : null;
      }

      if (aeroportos && Array.isArray(aeroportos) && aeroportos.length >= 2) {
        const detalhesAeroportos = [];
        for (const codigo of aeroportos) {
          const aeroporto = await prisma.aeroporto.findUnique({
            where: { codigo: codigo.toUpperCase() },
            select: {
              codigo: true,
              nome: true,
              cidade: true,
              estado: true,
              imagemUrl: true
            }
          });

          if (!aeroporto) {
            return res.status(404).json({
              success: false,
              message: `Aeroporto ${codigo} não encontrado`
            });
          }

          detalhesAeroportos.push(aeroporto);
        }

        dadosAtualizacao.aeroportos = aeroportos.map(a => a.toUpperCase());
        dadosAtualizacao.detalhesAeroportos = detalhesAeroportos;
      }

      const rotaAtualizada = await prisma.rotaSalva.update({
        where: { id },
        data: dadosAtualizacao,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        }
      });

      res.json({
        success: true,
        message: 'Rota atualizada com sucesso',
        data: rotaAtualizada
      });

    } catch (error) {
      console.error('Erro ao atualizar rota:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar rota',
        error: error.message
      });
    }
  }

  static async deletar(req, res) {
    try {
      const { id } = req.params;

      const rota = await prisma.rotaSalva.findUnique({
        where: { id }
      });

      if (!rota) {
        return res.status(404).json({
          success: false,
          message: 'Rota não encontrada'
        });
      }

      await prisma.rotaSalva.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Rota deletada permanentemente'
      });

    } catch (error) {
      console.error('Erro ao deletar rota:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar rota',
        error: error.message
      });
    }
  }

  static async listarTodas(req, res) {
    try {
      const rotas = await prisma.rotaSalva.findMany({
        where: { ativa: true },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        total: rotas.length,
        data: rotas
      });

    } catch (error) {
      console.error('Erro ao listar rotas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar rotas',
        error: error.message
      });
    }
  }
}

module.exports = RotaSalvaController;