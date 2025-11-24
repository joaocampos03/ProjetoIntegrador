const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class GrafoService {
  constructor() {
    this.listaAdjacencia = new Map();
    this.aeroportosCache = new Map();
  }

  // Carregar grafo do banco de dados
  async carregarGrafo() {
    try {
      console.log('📊 Carregando grafo do banco de dados...');

      // Buscar todas as rotas com relacionamentos
      const rotas = await prisma.rota.findMany({
        include: {
          aeroportoOrigem: true,
          aeroportoDestino: true
        }
      });

      // Limpar grafo atual
      this.listaAdjacencia.clear();
      this.aeroportosCache.clear();

      // Construir lista de adjacência
      for (const rota of rotas) {
        const origem = rota.codigoOrigem;
        const destino = rota.aeroportoDestino;

        // Adicionar aeroporto de origem se não existir
        if (!this.listaAdjacencia.has(origem)) {
          this.listaAdjacencia.set(origem, []);
        }

        // Adicionar destino à lista de adjacência
        this.listaAdjacencia.get(origem).push({
          codigo: destino.codigo,
          cidade: destino.cidade,
          estado: destino.estado,
          vooRegular: rota.vooRegular,
          frequenciaSemanal: rota.frequenciaSemanal
        });

        // Cache dos aeroportos
        if (!this.aeroportosCache.has(origem)) {
          this.aeroportosCache.set(origem, rota.aeroportoOrigem);
        }
        if (!this.aeroportosCache.has(destino.codigo)) {
          this.aeroportosCache.set(destino.codigo, destino);
        }
      }

      console.log(`✅ Grafo carregado: ${this.listaAdjacencia.size} aeroportos`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao carregar grafo:', error);
      throw error;
    }
  }

  // Verificar voo direto
  temVooDireto(origem, destino) {
    const destinos = this.listaAdjacencia.get(origem) || [];
    return destinos.some(a => a.codigo === destino);
  }

  // Encontrar rota mais curta (BFS)
  encontrarRotaMaisCurta(origem, destino) {
    if (origem === destino) {
      return [origem];
    }

    const fila = [[origem]];
    const visitados = new Set([origem]);

    while (fila.length > 0) {
      const rotaAtual = fila.shift();
      const atual = rotaAtual[rotaAtual.length - 1];

      const destinos = this.listaAdjacencia.get(atual) || [];
      for (const aeroporto of destinos) {
        if (aeroporto.codigo === destino) {
          return [...rotaAtual, destino];
        }

        if (!visitados.has(aeroporto.codigo)) {
          const novaRota = [...rotaAtual, aeroporto.codigo];
          fila.push(novaRota);
          visitados.add(aeroporto.codigo);
        }
      }
    }

    return [];
  }

  // Encontrar rotas com até N escalas (DFS)
  encontrarRotasComEscala(origem, destino, maxEscalas) {
    const rotas = [];
    const rotaAtual = [origem];
    const visitados = new Set([origem]);
    this.dfsRotas(origem, destino, rotaAtual, visitados, rotas, maxEscalas);
    return rotas;
  }

  dfsRotas(atual, destino, rotaAtual, visitados, rotas, maxEscalas) {
    if (rotaAtual.length > maxEscalas + 2) {
      return;
    }

    if (atual === destino && rotaAtual.length > 1) {
      rotas.push([...rotaAtual]);
      return;
    }

    const destinos = this.listaAdjacencia.get(atual) || [];
    for (const aeroporto of destinos) {
      if (!visitados.has(aeroporto.codigo)) {
        rotaAtual.push(aeroporto.codigo);
        visitados.add(aeroporto.codigo);
        this.dfsRotas(aeroporto.codigo, destino, rotaAtual, visitados, rotas, maxEscalas);
        rotaAtual.pop();
        visitados.delete(aeroporto.codigo);
      }
    }
  }

  // Obter todos os destinos diretos de um aeroporto
  getDestinos(aeroporto) {
    return this.listaAdjacencia.get(aeroporto) || [];
  }

  // Obter lista de todos os aeroportos
  getAeroportos() {
    return Array.from(this.listaAdjacencia.keys());
  }

  // Obter informações detalhadas de um aeroporto
  async getAeroportoDetalhes(codigo) {
    try {
      const aeroporto = await prisma.aeroporto.findUnique({
        where: { codigo },
        include: {
          rotasOrigem: {
            include: {
              aeroportoDestino: true
            }
          }
        }
      });

      if (!aeroporto) {
        return null;
      }

      return {
        ...aeroporto,
        totalRotas: aeroporto.rotasOrigem.length,
        destinos: aeroporto.rotasOrigem.map(r => ({
          codigo: r.aeroportoDestino.codigo,
          cidade: r.aeroportoDestino.cidade,
          estado: r.aeroportoDestino.estado,
          frequenciaSemanal: r.frequenciaSemanal
        }))
      };
    } catch (error) {
      console.error('Erro ao buscar aeroporto:', error);
      throw error;
    }
  }

  // Obter estatísticas do grafo
  async getEstatisticas() {
    try {
      const totalAeroportos = await prisma.aeroporto.count();
      const totalRotas = await prisma.rota.count();

      const topHubs = await prisma.aeroporto.findMany({
        orderBy: { frequenciaSemanal: 'desc' },
        take: 5
      });

      const aeroportosPorEstado = await prisma.aeroporto.groupBy({
        by: ['estado'],
        _count: {
          codigo: true
        },
        orderBy: {
          _count: {
            codigo: 'desc'
          }
        }
      });

      return {
        totalAeroportos,
        totalRotas,
        mediaConexoesPorAeroporto: (totalRotas / totalAeroportos).toFixed(2),
        topHubs: topHubs.map(h => ({
          codigo: h.codigo,
          cidade: h.cidade,
          estado: h.estado,
          frequenciaSemanal: h.frequenciaSemanal
        })),
        aeroportosPorEstado: aeroportosPorEstado.map(e => ({
          estado: e.estado,
          total: e._count.codigo
        }))
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Registrar consulta no banco
  async registrarConsulta(origem, destino, tipoConsulta, resultado, tempoResposta) {
    try {
      await prisma.consulta.create({
        data: {
          origem,
          destino,
          tipoConsulta,
          resultado,
          tempoResposta
        }
      });
    } catch (error) {
      console.error('Erro ao registrar consulta:', error);
      // Não lançar erro para não quebrar a aplicação
    }
  }

  // Buscar aeroportos por estado
  async buscarPorEstado(estado) {
    try {
      return await prisma.aeroporto.findMany({
        where: { estado },
        orderBy: { cidade: 'asc' }
      });
    } catch (error) {
      console.error('Erro ao buscar por estado:', error);
      throw error;
    }
  }

  // Buscar aeroportos por cidade
  async buscarPorCidade(cidade) {
    try {
      return await prisma.aeroporto.findMany({
        where: {
          cidade: {
            contains: cidade,
            mode: 'insensitive'
          }
        },
        orderBy: { cidade: 'asc' }
      });
    } catch (error) {
      console.error('Erro ao buscar por cidade:', error);
      throw error;
    }
  }

  // Listar todas as rotas de um aeroporto
  async listarRotasAeroporto(codigo) {
    try {
      const rotas = await prisma.rota.findMany({
        where: { codigoOrigem: codigo },
        include: {
          aeroportoDestino: true
        },
        orderBy: {
          frequenciaSemanal: 'desc'
        }
      });

      return rotas.map(r => ({
        destino: {
          codigo: r.aeroportoDestino.codigo,
          cidade: r.aeroportoDestino.cidade,
          estado: r.aeroportoDestino.estado
        },
        frequenciaSemanal: r.frequenciaSemanal,
        vooRegular: r.vooRegular
      }));
    } catch (error) {
      console.error('Erro ao listar rotas:', error);
      throw error;
    }
  }
}

// Singleton instance
const grafoService = new GrafoService();

module.exports = grafoService;