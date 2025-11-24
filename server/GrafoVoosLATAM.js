class Aeroporto {
    constructor(codigo, cidade, estado, vooRegular, frequenciaSemanal) {
        this.codigo = codigo;
        this.cidade = cidade;
        this.estado = estado;
        this.vooRegular = vooRegular;
        this.frequenciaSemanal = frequenciaSemanal;
    }

    getCodigo() {
        return this.codigo;
    }

    getCidade() {
        return this.cidade;
    }

    getEstado() {
        return this.estado;
    }

    isVooRegular() {
        return this.vooRegular;
    }

    getFrequenciaSemanal() {
        return this.frequenciaSemanal;
    }

    toString() {
        return `${this.cidade} (${this.codigo}-${this.estado}) - ${this.frequenciaSemanal} voos/semana`;
    }

    equals(obj) {
        if (this === obj) return true;
        if (!obj || !(obj instanceof Aeroporto)) return false;
        return this.codigo === obj.codigo;
    }
}

class GrafoVoosLATAM {
    constructor() {
        this.listaAdjacencia = new Map();
        this.inicializarRotasLATAM();
    }

    adicionarAeroporto(codigo) {
        if (!this.listaAdjacencia.has(codigo)) {
            this.listaAdjacencia.set(codigo, []);
        }
    }

    adicionarRota(origem, destino) {
        this.adicionarAeroporto(origem);
        this.adicionarAeroporto(destino.getCodigo());
        this.listaAdjacencia.get(origem).push(destino);
    }

    adicionarRotaBidirecional(aeroporto1, codigo2, cidade2, estado2, vooRegular, frequencia) {
        const destino1 = new Aeroporto(codigo2, cidade2, estado2, vooRegular, frequencia);
        const dadosAeroporto1 = this.obterDadosAeroporto(aeroporto1);
        const destino2 = new Aeroporto(aeroporto1, dadosAeroporto1[0], dadosAeroporto1[1], vooRegular, frequencia);
        this.adicionarRota(aeroporto1, destino1);
        this.adicionarRota(codigo2, destino2);
    }

    inicializarRotasLATAM() {
        this.adicionarRotaBidirecional("GRU", "BSB", "Brasília", "DF", true, 35);
        this.adicionarRotaBidirecional("GRU", "GIG", "Rio de Janeiro", "RJ", true, 42);
        this.adicionarRotaBidirecional("GRU", "CGH", "São Paulo Congonhas", "SP", true, 28);
        this.adicionarRotaBidirecional("GRU", "SDU", "Rio de Janeiro Santos Dumont", "RJ", true, 21);
        this.adicionarRotaBidirecional("GRU", "FOR", "Fortaleza", "CE", true, 28);
        this.adicionarRotaBidirecional("GRU", "REC", "Recife", "PE", true, 21);
        this.adicionarRotaBidirecional("GRU", "SSA", "Salvador", "BA", true, 28);
        this.adicionarRotaBidirecional("GRU", "BEL", "Belém", "PA", true, 14);
        this.adicionarRotaBidirecional("GRU", "MAO", "Manaus", "AM", true, 14);
        this.adicionarRotaBidirecional("GRU", "CWB", "Curitiba", "PR", true, 35);
        this.adicionarRotaBidirecional("GRU", "FLN", "Florianópolis", "SC", true, 21);
        this.adicionarRotaBidirecional("GRU", "POA", "Porto Alegre", "RS", true, 28);
        this.adicionarRotaBidirecional("GRU", "CNF", "Belo Horizonte", "MG", true, 28);
        this.adicionarRotaBidirecional("GRU", "VIX", "Vitória", "ES", true, 21);
        this.adicionarRotaBidirecional("GRU", "NAT", "Natal", "RN", true, 14);
        this.adicionarRotaBidirecional("GRU", "MCZ", "Maceió", "AL", true, 14);
        this.adicionarRotaBidirecional("GRU", "AJU", "Aracaju", "SE", true, 7);
        this.adicionarRotaBidirecional("GRU", "THE", "Teresina", "PI", true, 7);
        this.adicionarRotaBidirecional("GRU", "SLZ", "São Luís", "MA", true, 7);
        this.adicionarRotaBidirecional("GRU", "CGB", "Cuiabá", "MT", true, 21);
        this.adicionarRotaBidirecional("GRU", "CGR", "Campo Grande", "MS", true, 14);
        this.adicionarRotaBidirecional("GRU", "GYN", "Goiânia", "GO", true, 21);
        this.adicionarRotaBidirecional("BSB", "FOR", "Fortaleza", "CE", true, 21);
        this.adicionarRotaBidirecional("BSB", "REC", "Recife", "PE", true, 14);
        this.adicionarRotaBidirecional("BSB", "SSA", "Salvador", "BA", true, 14);
        this.adicionarRotaBidirecional("BSB", "BEL", "Belém", "PA", true, 14);
        this.adicionarRotaBidirecional("BSB", "MAO", "Manaus", "AM", true, 14);
        this.adicionarRotaBidirecional("BSB", "CWB", "Curitiba", "PR", true, 14);
        this.adicionarRotaBidirecional("BSB", "POA", "Porto Alegre", "RS", true, 14);
        this.adicionarRotaBidirecional("BSB", "CNF", "Belo Horizonte", "MG", true, 21);
        this.adicionarRotaBidirecional("BSB", "CGB", "Cuiabá", "MT", true, 21);
        this.adicionarRotaBidirecional("BSB", "GYN", "Goiânia", "GO", true, 28);
        this.adicionarRotaBidirecional("FOR", "REC", "Recife", "PE", true, 21);
        this.adicionarRotaBidirecional("FOR", "SSA", "Salvador", "BA", true, 14);
        this.adicionarRotaBidirecional("FOR", "BEL", "Belém", "PA", true, 14);
        this.adicionarRotaBidirecional("FOR", "MAO", "Manaus", "AM", true, 7);
        this.adicionarRotaBidirecional("FOR", "NAT", "Natal", "RN", true, 14);
        this.adicionarRotaBidirecional("FOR", "JPA", "João Pessoa", "PB", true, 7);
        this.adicionarRotaBidirecional("FOR", "MCZ", "Maceió", "AL", true, 7);
        this.adicionarRotaBidirecional("FOR", "AJU", "Aracaju", "SE", true, 7);
        this.adicionarRotaBidirecional("FOR", "THE", "Teresina", "PI", true, 7);
        this.adicionarRotaBidirecional("FOR", "SLZ", "São Luís", "MA", true, 7);
        this.adicionarRotaBidirecional("FOR", "PHB", "Parnaíba", "PI", true, 2);
        this.adicionarRotaBidirecional("GIG", "CNF", "Belo Horizonte", "MG", true, 14);
        this.adicionarRotaBidirecional("GIG", "CWB", "Curitiba", "PR", true, 14);
        this.adicionarRotaBidirecional("GIG", "FLN", "Florianópolis", "SC", true, 7);
        this.adicionarRotaBidirecional("GIG", "POA", "Porto Alegre", "RS", true, 14);
        this.adicionarRotaBidirecional("GIG", "FOR", "Fortaleza", "CE", true, 14);
        this.adicionarRotaBidirecional("GIG", "REC", "Recife", "PE", true, 14);
        this.adicionarRotaBidirecional("GIG", "SSA", "Salvador", "BA", true, 14);
        this.adicionarRotaBidirecional("SDU", "CNF", "Belo Horizonte", "MG", true, 21);
        this.adicionarRotaBidirecional("SDU", "CWB", "Curitiba", "PR", true, 7);
        this.adicionarRotaBidirecional("SDU", "FLN", "Florianópolis", "SC", true, 7);
        this.adicionarRotaBidirecional("SDU", "POA", "Porto Alegre", "RS", true, 7);
        this.adicionarRotaBidirecional("SDU", "SSA", "Salvador", "BA", true, 7);
        this.adicionarRotaBidirecional("POA", "FLN", "Florianópolis", "SC", true, 7);
        this.adicionarRotaBidirecional("POA", "CNF", "Belo Horizonte", "MG", true, 7);
        this.adicionarRotaBidirecional("CWB", "FLN", "Florianópolis", "SC", true, 14);
        this.adicionarRotaBidirecional("CNF", "SSA", "Salvador", "BA", true, 7);
        this.adicionarRotaBidirecional("CNF", "FOR", "Fortaleza", "CE", true, 7);
        this.adicionarRotaBidirecional("REC", "SSA", "Salvador", "BA", true, 14);
        this.adicionarRotaBidirecional("REC", "NAT", "Natal", "RN", true, 14);
        this.adicionarRotaBidirecional("REC", "MCZ", "Maceió", "AL", true, 7);
        this.adicionarRotaBidirecional("SSA", "BEL", "Belém", "PA", true, 7);
        this.adicionarRotaBidirecional("CGB", "CGR", "Campo Grande", "MS", true, 7);
    }

    obterDadosAeroporto(codigo) {
        const aeroportos = {
            "GRU": ["São Paulo", "SP"],
            "CGH": ["São Paulo", "SP"],
            "BSB": ["Brasília", "DF"],
            "FOR": ["Fortaleza", "CE"],
            "GIG": ["Rio de Janeiro", "RJ"],
            "SDU": ["Rio de Janeiro", "RJ"],
            "REC": ["Recife", "PE"],
            "SSA": ["Salvador", "BA"],
            "BEL": ["Belém", "PA"],
            "MAO": ["Manaus", "AM"],
            "CWB": ["Curitiba", "PR"],
            "FLN": ["Florianópolis", "SC"],
            "POA": ["Porto Alegre", "RS"],
            "CNF": ["Belo Horizonte", "MG"],
            "VIX": ["Vitória", "ES"],
            "NAT": ["Natal", "RN"],
            "MCZ": ["Maceió", "AL"],
            "AJU": ["Aracaju", "SE"],
            "THE": ["Teresina", "PI"],
            "SLZ": ["São Luís", "MA"],
            "CGB": ["Cuiabá", "MT"],
            "CGR": ["Campo Grande", "MS"],
            "GYN": ["Goiânia", "GO"],
            "JPA": ["João Pessoa", "PB"],
            "PHB": ["Parnaíba", "PI"]
        };
        return aeroportos[codigo] || ["Desconhecida", "XX"];
    }

    getAeroportos() {
        return Array.from(this.listaAdjacencia.keys());
    }

    getDestinos(aeroporto) {
        return this.listaAdjacencia.get(aeroporto) || [];
    }

    temVooDireto(origem, destino) {
        const destinos = this.getDestinos(origem);
        return destinos.some(a => a.getCodigo() === destino);
    }

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

        const destinos = this.getDestinos(atual);
        for (const aeroporto of destinos) {
            if (!visitados.has(aeroporto.getCodigo())) {
                rotaAtual.push(aeroporto.getCodigo());
                visitados.add(aeroporto.getCodigo());
                this.dfsRotas(aeroporto.getCodigo(), destino, rotaAtual, visitados, rotas, maxEscalas);
                rotaAtual.pop();
                visitados.delete(aeroporto.getCodigo());
            }
        }
    }

    encontrarRotaMaisCurta(origem, destino) {
        if (origem === destino) {
            return [origem];
        }

        const fila = [[origem]];
        const visitados = new Set([origem]);

        while (fila.length > 0) {
            const rotaAtual = fila.shift();
            const atual = rotaAtual[rotaAtual.length - 1];

            const destinos = this.getDestinos(atual);
            for (const aeroporto of destinos) {
                if (aeroporto.getCodigo() === destino) {
                    return [...rotaAtual, destino];
                }

                if (!visitados.has(aeroporto.getCodigo())) {
                    const novaRota = [...rotaAtual, aeroporto.getCodigo()];
                    fila.push(novaRota);
                    visitados.add(aeroporto.getCodigo());
                }
            }
        }

        return [];
    }

    exibirGrafo() {
        console.log("=== GRAFO DE VOOS LATAM BRASIL ===");
        console.log(`Total de aeroportos: ${this.listaAdjacencia.size}`);
        console.log();

        const aeroportosPorEstado = new Map();

        for (const codigo of this.listaAdjacencia.keys()) {
            const dados = this.obterDadosAeroporto(codigo);
            const estado = dados[1];
            if (!aeroportosPorEstado.has(estado)) {
                aeroportosPorEstado.set(estado, []);
            }
            aeroportosPorEstado.get(estado).push(codigo);
        }

        for (const [estado, codigos] of aeroportosPorEstado) {
            console.log(`=== ESTADO: ${estado} ===`);

            for (const codigo of codigos) {
                const dados = this.obterDadosAeroporto(codigo);
                console.log(`${codigo} - ${dados[0]} (${dados[1]})`);

                const destinos = this.getDestinos(codigo);
                destinos.sort((a, b) => a.getCodigo().localeCompare(b.getCodigo()));

                console.log(`  Destinos diretos (${destinos.length}):`);
                for (const destino of destinos) {
                    console.log(`    → ${destino.toString()}`);
                }
                console.log();
            }
        }
    }

    exibirEstatisticas() {
        console.log("=== ESTATÍSTICAS DO GRAFO ===");
        const totalAeroportos = this.listaAdjacencia.size;
        const totalRotas = Array.from(this.listaAdjacencia.values())
            .reduce((sum, list) => sum + list.length, 0);

        let hubPrincipal = "";
        let maxConexoes = 0;

        for (const [codigo, destinos] of this.listaAdjacencia) {
            if (destinos.length > maxConexoes) {
                maxConexoes = destinos.length;
                hubPrincipal = codigo;
            }
        }

        console.log(`Total de aeroportos: ${totalAeroportos}`);
        console.log(`Total de rotas: ${totalRotas}`);
        console.log(`Média de conexões por aeroporto: ${(totalRotas / totalAeroportos).toFixed(2)}`);
        console.log(`Hub principal: ${hubPrincipal} (${maxConexoes} conexões)`);

        console.log("\nTop 5 Hubs:");
        const hubs = Array.from(this.listaAdjacencia.entries())
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 5);

        hubs.forEach((entry, index) => {
            const dados = this.obterDadosAeroporto(entry[0]);
            console.log(`${index + 1}. ${entry[0]} - ${dados[0]} (${dados[1]}) - ${entry[1].length} conexões`);
        });
    }
}

function main() {
    const grafo = new GrafoVoosLATAM();

    console.log("GRAFO DE ROTAS LATAM BRASIL - Implementação com Lista de Adjacências");
    console.log("================================================================\n");

    grafo.exibirEstatisticas();
    console.log();

    console.log("=== EXEMPLOS DE CONSULTAS ===");
    console.log(`1. Voo direto GRU → FOR: ${grafo.temVooDireto("GRU", "FOR") ? "SIM" : "NÃO"}`);

    const rotaCurta = grafo.encontrarRotaMaisCurta("POA", "FOR");
    console.log(`2. Rota mais curta POA → FOR: ${rotaCurta.join(" → ")}`);

    const rotasEscala = grafo.encontrarRotasComEscala("FLN", "REC", 1);
    console.log("3. Rotas FLN → REC (máx 1 escala):");
    for (let i = 0; i < Math.min(3, rotasEscala.length); i++) {
        console.log(`   ${rotasEscala[i].join(" → ")}`);
    }

    const destinosGRU = grafo.getDestinos("GRU");
    console.log(`4. Destinos diretos do GRU (${destinosGRU.length} destinos):`);
    destinosGRU.sort((a, b) => a.getCodigo().localeCompare(b.getCodigo()));
    for (let i = 0; i < Math.min(5, destinosGRU.length); i++) {
        console.log(`   → ${destinosGRU[i].toString()}`);
    }

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GrafoVoosLATAM, Aeroporto };
}

if (require.main === module) {
    main();
}