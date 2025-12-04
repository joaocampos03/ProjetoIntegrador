const { PrismaClient } = require('@prisma/client');
const grafoService = require('../services/grafoService');

const prisma = new PrismaClient();

class RotasController {
  
  // Método auxiliar para garantir que o grafo está carregado
  static async garantirGrafoCarregado() {
    const aeroportosNoGrafo = grafoService.getAeroportos();
    if (aeroportosNoGrafo.length === 0) {
      await grafoService.carregarGrafo();
    }
  }

  // Buscar melhor caminho entre dois aeroportos (MENOR NÚMERO DE ESCALAS)
  static async melhorCaminho(req, res) {
    try {
      const { origem, destino } = req.params;
      const inicio = Date.now();

      // Validar aeroportos
      const origemUpper = origem.toUpperCase();
      const destinoUpper = destino.toUpperCase();

      if (origemUpper === destinoUpper) {
        return res.status(400).json({
          success: false,
          message: 'Origem e destino não podem ser iguais'
        });
      }

      // Verificar se aeroportos existem
      const aeroportoOrigem = await prisma.aeroporto.findUnique({
        where: { codigo: origemUpper }
      });

      const aeroportoDestino = await prisma.aeroporto.findUnique({
        where: { codigo: destinoUpper }
      });

      if (!aeroportoOrigem) {
        return res.status(404).json({
          success: false,
          message: `Aeroporto de origem ${origemUpper} não encontrado`
        });
      }

      if (!aeroportoDestino) {
        return res.status(404).json({
          success: false,
          message: `Aeroporto de destino ${destinoUpper} não encontrado`
        });
      }

      // Garantir que o grafo está carregado (importante para Vercel/serverless)
      await RotasController.garantirGrafoCarregado();

      // Buscar melhor rota usando BFS (MENOR NÚMERO DE ESCALAS)
      const rotaCodigos = grafoService.encontrarRotaMaisCurta(origemUpper, destinoUpper);

      if (!rotaCodigos || rotaCodigos.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Não existe rota entre ${origemUpper} e ${destinoUpper}`
        });
      }

      // Buscar detalhes de cada aeroporto e calcular preços dos trechos
      const detalhesRota = [];
      const trechos = [];
      let precoTotal = 0;

      for (let i = 0; i < rotaCodigos.length; i++) {
        const codigo = rotaCodigos[i];
        
        // Buscar aeroporto
        const aeroporto = await prisma.aeroporto.findUnique({
          where: { codigo }
        });

        detalhesRota.push({
          codigo: aeroporto.codigo,
          nome: aeroporto.nome,
          cidade: aeroporto.cidade,
          estado: aeroporto.estado,
          latitude: aeroporto.latitude,
          longitude: aeroporto.longitude,
          ordem: i + 1
        });

        // Se não é o último, buscar trecho
        if (i < rotaCodigos.length - 1) {
          const proximoCodigo = rotaCodigos[i + 1];
          
          const rota = await prisma.rota.findFirst({
            where: {
              codigoOrigem: codigo,
              codigoDestino: proximoCodigo
            }
          });

          if (rota) {
            trechos.push({
              origem: codigo,
              destino: proximoCodigo,
              preco: rota.preco,
              frequenciaSemanal: rota.frequenciaSemanal
            });
            precoTotal += rota.preco;
          }
        }
      }

      const tempoResposta = Date.now() - inicio;

      // Registrar consulta
      await grafoService.registrarConsulta(
        origemUpper,
        destinoUpper,
        'melhor_caminho',
        { rotaCodigos, precoTotal, escalas: rotaCodigos.length - 2 },
        tempoResposta
      );

      res.json({
        success: true,
        data: {
          origem: {
            codigo: origemUpper,
            nome: aeroportoOrigem.nome,
            cidade: aeroportoOrigem.cidade
          },
          destino: {
            codigo: destinoUpper,
            nome: aeroportoDestino.nome,
            cidade: aeroportoDestino.cidade
          },
          rota: detalhesRota,
          trechos: trechos,
          resumo: {
            totalAeroportos: rotaCodigos.length,
            totalTrechos: trechos.length,
            escalas: rotaCodigos.length - 2,
            precoTotal: precoTotal,
            tempoResposta: `${tempoResposta}ms`
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar melhor caminho:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar melhor caminho',
        error: error.message
      });
    }
  }

  // Buscar todas as rotas alternativas (com limite de escalas)
  static async rotasAlternativas(req, res) {
    try {
      const { origem, destino } = req.params;
      const maxEscalas = parseInt(req.query.maxEscalas) || 2;
      const inicio = Date.now();

      // Validar
      const origemUpper = origem.toUpperCase();
      const destinoUpper = destino.toUpperCase();

      if (origemUpper === destinoUpper) {
        return res.status(400).json({
          success: false,
          message: 'Origem e destino não podem ser iguais'
        });
      }

      if (maxEscalas < 0 || maxEscalas > 5) {
        return res.status(400).json({
          success: false,
          message: 'Máximo de escalas deve estar entre 0 e 5'
        });
      }

      // Verificar se aeroportos existem
      const aeroportoOrigem = await prisma.aeroporto.findUnique({
        where: { codigo: origemUpper }
      });

      const aeroportoDestino = await prisma.aeroporto.findUnique({
        where: { codigo: destinoUpper }
      });

      if (!aeroportoOrigem || !aeroportoDestino) {
        return res.status(404).json({
          success: false,
          message: 'Aeroporto não encontrado'
        });
      }

      // Garantir que o grafo está carregado (importante para Vercel/serverless)
      await RotasController.garantirGrafoCarregado();

      // Buscar rotas alternativas usando DFS
      const rotasEncontradas = grafoService.encontrarRotasComEscala(
        origemUpper,
        destinoUpper,
        maxEscalas
      );

      if (!rotasEncontradas || rotasEncontradas.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Não existem rotas entre ${origemUpper} e ${destinoUpper} com até ${maxEscalas} escala(s)`
        });
      }

      // Processar cada rota encontrada
      const rotasDetalhadas = [];

      for (const rotaCodigos of rotasEncontradas) {
        const trechos = [];
        let precoTotal = 0;

        // Calcular preço de cada trecho
        for (let i = 0; i < rotaCodigos.length - 1; i++) {
          const origem = rotaCodigos[i];
          const destino = rotaCodigos[i + 1];

          const rota = await prisma.rota.findFirst({
            where: {
              codigoOrigem: origem,
              codigoDestino: destino
            }
          });

          if (rota) {
            trechos.push({
              origem,
              destino,
              preco: rota.preco,
              frequenciaSemanal: rota.frequenciaSemanal
            });
            precoTotal += rota.preco;
          }
        }

        rotasDetalhadas.push({
          aeroportos: rotaCodigos,
          trechos: trechos,
          escalas: rotaCodigos.length - 2,
          precoTotal: precoTotal
        });
      }

      // Ordenar por preço (mais barato primeiro)
      rotasDetalhadas.sort((a, b) => a.precoTotal - b.precoTotal);

      const tempoResposta = Date.now() - inicio;

      // Registrar consulta
      await grafoService.registrarConsulta(
        origemUpper,
        destinoUpper,
        'rotas_alternativas',
        { totalRotas: rotasDetalhadas.length, maxEscalas },
        tempoResposta
      );

      res.json({
        success: true,
        data: {
          origem: {
            codigo: origemUpper,
            nome: aeroportoOrigem.nome,
            cidade: aeroportoOrigem.cidade
          },
          destino: {
            codigo: destinoUpper,
            nome: aeroportoDestino.nome,
            cidade: aeroportoDestino.cidade
          },
          parametros: {
            maxEscalas,
            totalRotasEncontradas: rotasDetalhadas.length
          },
          rotas: rotasDetalhadas,
          maisBarata: rotasDetalhadas[0],
          resumo: {
            rotaMaisBarata: rotasDetalhadas[0].precoTotal,
            rotaMaisCara: rotasDetalhadas[rotasDetalhadas.length - 1].precoTotal,
            diferencaPreco: rotasDetalhadas[rotasDetalhadas.length - 1].precoTotal - rotasDetalhadas[0].precoTotal,
            tempoResposta: `${tempoResposta}ms`
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar rotas alternativas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar rotas alternativas',
        error: error.message
      });
    }
  }

  // Verificar se existe voo direto
  static async vooDireto(req, res) {
    try {
      const { origem, destino } = req.params;

      const origemUpper = origem.toUpperCase();
      const destinoUpper = destino.toUpperCase();

      // Garantir que o grafo está carregado (importante para Vercel/serverless)
      await RotasController.garantirGrafoCarregado();

      // Usar o grafo para verificar
      const existe = grafoService.temVooDireto(origemUpper, destinoUpper);

      if (!existe) {
        return res.json({
          success: true,
          data: {
            origem: origemUpper,
            destino: destinoUpper,
            vooDireto: false,
            message: 'Não existe voo direto entre estes aeroportos'
          }
        });
      }

      // Buscar detalhes da rota
      const rota = await prisma.rota.findFirst({
        where: {
          codigoOrigem: origemUpper,
          codigoDestino: destinoUpper
        },
        include: {
          aeroportoOrigem: true,
          aeroportoDestino: true
        }
      });

      res.json({
        success: true,
        data: {
          origem: {
            codigo: rota.aeroportoOrigem.codigo,
            nome: rota.aeroportoOrigem.nome,
            cidade: rota.aeroportoOrigem.cidade
          },
          destino: {
            codigo: rota.aeroportoDestino.codigo,
            nome: rota.aeroportoDestino.nome,
            cidade: rota.aeroportoDestino.cidade
          },
          vooDireto: true,
          preco: rota.preco,
          frequenciaSemanal: rota.frequenciaSemanal
        }
      });

    } catch (error) {
      console.error('Erro ao verificar voo direto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar voo direto',
        error: error.message
      });
    }
  }
}

module.exports = RotasController;