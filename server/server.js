const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const grafoService = require('./services/grafoService');
const UserController = require('./controllers/userController');
const RotaSalvaController = require('./controllers/rotaSalvaController');
const RotasController = require('./controllers/rotasController');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let grafoCarregado = false;

async function inicializarGrafo() {
  if (!grafoCarregado) {
    try {
      await grafoService.carregarGrafo();
      grafoCarregado = true;
      console.log('✅ Grafo carregado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar grafo:', error);
    }
  }
}

// ========================================
// ENDPOINT: Listagem de Aeroportos
// ========================================
app.get('/aeroportos', async (req, res) => {
  try {
    const aeroportos = await prisma.aeroporto.findMany({
      include: {
        rotasOrigem: {
          include: {
            aeroportoDestino: {
              select: {
                id: true,
                codigo: true,
                nome: true,
                cidade: true,
                estado: true
              }
            }
          }
        }
      },
      orderBy: {
        cidade: 'asc'
      }
    });

    const aeroportosFormatados = aeroportos.map(aeroporto => ({
      id: aeroporto.id,
      codigo: aeroporto.codigo,
      nome: aeroporto.nome,
      localizacao: {
        cidade: aeroporto.cidade,
        estado: aeroporto.estado,
        latitude: aeroporto.latitude,
        longitude: aeroporto.longitude,
        pais: 'Brasil'
      },
      descricao: aeroporto.descricao,
      imagemUrl: aeroporto.imagemUrl,
      voosDisponiveis: aeroporto.rotasOrigem.map(rota => ({
        destinoId: rota.aeroportoDestino.id,
        codigo: rota.aeroportoDestino.codigo,
        nome: rota.aeroportoDestino.nome,
        cidade: rota.aeroportoDestino.cidade,
        estado: rota.aeroportoDestino.estado,
        frequenciaSemanal: rota.frequenciaSemanal,
        preco: rota.preco
      })).sort((a, b) => b.frequenciaSemanal - a.frequenciaSemanal),
      totalVoos: aeroporto.rotasOrigem.length,
      frequenciaSemanal: aeroporto.frequenciaSemanal
    }));

    res.json({
      success: true,
      total: aeroportosFormatados.length,
      data: aeroportosFormatados
    });

  } catch (error) {
    console.error('Erro ao buscar aeroportos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aeroportos',
      error: error.message
    });
  }
});

// ========================================
// ENDPOINT: Detalhes de um Aeroporto
// ========================================
app.get('/aeroportos/detalhes/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;

    const aeroporto = await prisma.aeroporto.findUnique({
      where: { codigo: codigo.toUpperCase() },
      include: {
        rotasOrigem: {
          include: {
            aeroportoDestino: true
          },
          orderBy: {
            frequenciaSemanal: 'desc'
          }
        }
      }
    });

    if (!aeroporto) {
      return res.status(404).json({
        success: false,
        message: 'Aeroporto não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        id: aeroporto.id,
        codigo: aeroporto.codigo,
        nome: aeroporto.nome,
        localizacao: {
          cidade: aeroporto.cidade,
          estado: aeroporto.estado,
          pais: 'Brasil'
        },
        descricao: aeroporto.descricao,
        imagemUrl: aeroporto.imagemUrl,
        voosDisponiveis: aeroporto.rotasOrigem.map(rota => ({
          destinoId: rota.aeroportoDestino.id,
          codigo: rota.aeroportoDestino.codigo,
          nome: rota.aeroportoDestino.nome,
          cidade: rota.aeroportoDestino.cidade,
          estado: rota.aeroportoDestino.estado,
          descricao: rota.aeroportoDestino.descricao,
          imagemUrl: rota.aeroportoDestino.imagemUrl,
          frequenciaSemanal: rota.frequenciaSemanal,
          vooRegular: rota.vooRegular,
          preco: rota.preco
        })),
        estatisticas: {
          totalVoos: aeroporto.rotasOrigem.length,
          frequenciaSemanal: aeroporto.frequenciaSemanal,
          vooRegular: aeroporto.vooRegular
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar aeroporto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aeroporto',
      error: error.message
    });
  }
});

// ========================================
// ENDPOINT: Buscar Aeroportos por Estado
// ========================================
app.get('/aeroportos/estado/:estado', async (req, res) => {
  try {
    const { estado } = req.params;

    const aeroportos = await prisma.aeroporto.findMany({
      where: {
        estado: estado.toUpperCase()
      },
      include: {
        rotasOrigem: {
          include: {
            aeroportoDestino: {
              select: {
                codigo: true,
                nome: true,
                cidade: true,
                estado: true
              }
            }
          }
        }
      },
      orderBy: {
        cidade: 'asc'
      }
    });

    const aeroportosFormatados = aeroportos.map(aeroporto => ({
      id: aeroporto.id,
      codigo: aeroporto.codigo,
      nome: aeroporto.nome,
      localizacao: {
        cidade: aeroporto.cidade,
        estado: aeroporto.estado
      },
      descricao: aeroporto.descricao,
      imagemUrl: aeroporto.imagemUrl,
      totalVoos: aeroporto.rotasOrigem.length
    }));

    res.json({
      success: true,
      estado: estado.toUpperCase(),
      total: aeroportosFormatados.length,
      data: aeroportosFormatados
    });

  } catch (error) {
    console.error('Erro ao buscar aeroportos por estado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aeroportos',
      error: error.message
    });
  }
});

// ========================================
// Endpoints de busca de rotas, usando grafo
// ========================================
app.get('/melhor-rota/:origem/:destino', RotasController.melhorCaminho);
app.get('/rotas-alternativas/:origem/:destino', RotasController.rotasAlternativas);
app.get('/rotas-voo-direto/:origem/:destino', RotasController.vooDireto);

// ========================================
// Endpoints de usuários
// ========================================
app.post('/cadastrar-usuario', UserController.cadastrar);
app.post('/login', UserController.login);
app.get('/usuario/:id', UserController.buscarPorId);
app.get('/usuarios', UserController.listar);
app.put('/atualizar-usuario/:id', UserController.atualizar);

// ========================================
// Endpoints de rotas salvas
// ========================================
app.post('/salvar-rota', RotaSalvaController.salvar);
app.get('/rota-salva/:usuarioId', RotaSalvaController.listarPorUsuario);
app.get('/rota-salva/:id', RotaSalvaController.buscarPorId);
app.put('/atualizar-rota/:id', RotaSalvaController.atualizar);
app.delete('/deletar-rota/:id', RotaSalvaController.deletar);
app.get('/rotas-salvas', RotaSalvaController.listarTodas);

// ========================================
// Health Check
// ========================================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API LATAM Rotas funcionando!',
    grafoCarregado,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  
  await inicializarGrafo();
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
});

module.exports = app;