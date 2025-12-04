# ✈️ FacilitaVoos - Sistema de Rotas Aéreas LATAM Brasil

Sistema para busca e gerenciamento de rotas aéreas da LATAM no Brasil, utilizando estrutura de dados em grafo para encontrar os melhores caminhos entre aeroportos.

## 🎯 Sobre o Projeto

O **FacilitaVoos** é um sistema desenvolvido como Projeto Integrador que permite aos usuários:

- Buscar rotas aéreas entre aeroportos brasileiros
- Encontrar o melhor caminho (menor número de escalas)
- Visualizar rotas alternativas com diferentes preços
- Salvar rotas favoritas
- Compartilhar rotas com outras pessoas através de links únicos

## 🧮 Algoritmos Utilizados

O sistema utiliza um **grafo** implementado com **lista de adjacência** para representar a malha aérea da LATAM Brasil, com 25 aeroportos e suas conexões.

### BFS (Breadth-First Search)
Encontra a rota com **menor número de escalas** entre dois aeroportos.

### DFS (Depth-First Search)
Lista **todas as rotas possíveis** com um limite de escalas configurável.

## 🛠 Tecnologias

**Backend:** Node.js, Express, Prisma, MongoDB

**Frontend:** React, TypeScript, Vite

## 📁 Estrutura do Projeto

```
ProjetoIntegrador/
├── client/                    # Frontend React
│   └── projeto-integrador/
│
├── server/                    # Backend Node.js
│   ├── controllers/           # Controladores da API
│   ├── services/              # Serviços (grafo)
│   ├── schema.prisma          # Modelo do banco de dados
│   ├── seed.js                # Dados iniciais
│   └── server.js              # Servidor Express
│
└── README.md
```

## 🗺️ Aeroportos Disponíveis

O sistema conta com **25 aeroportos** da malha LATAM Brasil, incluindo:

- **Sudeste:** GRU, CGH, GIG, SDU, CNF, VIX
- **Nordeste:** FOR, REC, SSA, NAT, MCZ, AJU, JPA, THE, SLZ, PHB
- **Norte:** MAO, BEL
- **Sul:** POA, CWB, FLN
- **Centro-Oeste:** BSB, CGB, CGR, GYN

## 👥 Autores

**João Marcelo Campos** - Backend
**Guilherme Santos** - Frontend