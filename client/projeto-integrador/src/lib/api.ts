const API_URL =
  import.meta.env.VITE_API_URL || "https://facilitavoos-backend.vercel.app";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

interface Airport {
  id: string;
  codigo: string;
  nome: string;
  localizacao: {
    cidade: string;
    estado: string;
    latitude: number;
    longitude: number;
    pais: string;
  };
  descricao: string;
  imagemUrl: string;
  voosDisponiveis?: Array<{
    destinoId: string;
    codigo: string;
    nome: string;
    cidade: string;
    estado: string;
    frequenciaSemanal: number;
    preco: number;
  }>;
  totalVoos?: number;
  frequenciaSemanal?: number;
}

interface AirportDetails extends Airport {
  estatisticas?: {
    totalVoos: number;
    frequenciaSemanal: number;
    vooRegular: boolean;
  };
}

interface RouteSegment {
  origem: string;
  destino: string;
  preco: number;
  frequenciaSemanal: number;
}

interface RouteAirport {
  codigo: string;
  nome: string;
  cidade: string;
  estado?: string;
  latitude?: number;
  longitude?: number;
  ordem?: number;
}

interface BestRoute {
  origem: {
    codigo: string;
    nome: string;
    cidade: string;
  };
  destino: {
    codigo: string;
    nome: string;
    cidade: string;
  };
  rota: RouteAirport[];
  trechos: RouteSegment[];
  resumo: {
    totalAeroportos: number;
    totalTrechos: number;
    escalas: number;
    precoTotal: number;
    tempoResposta?: string;
  };
}

interface AlternativeRoute {
  aeroportos: string[];
  trechos: RouteSegment[];
  escalas: number;
  precoTotal: number;
}

interface AlternativeRoutesResponse {
  origem: {
    codigo: string;
    nome: string;
    cidade: string;
  };
  destino: {
    codigo: string;
    nome: string;
    cidade: string;
  };
  parametros: {
    maxEscalas: number;
    totalRotasEncontradas: number;
  };
  rotas: AlternativeRoute[];
  maisBarata: AlternativeRoute;
  resumo: {
    rotaMaisBarata: number;
    rotaMaisCara: number;
    diferencaPreco: number;
    tempoResposta: string;
  };
}

interface DirectFlight {
  origem: {
    codigo: string;
    nome: string;
    cidade: string;
  };
  destino: {
    codigo: string;
    nome: string;
    cidade: string;
  };
  vooDireto: boolean;
  preco?: number;
  frequenciaSemanal?: number;
  message?: string;
}

interface User {
  id: string;
  nome: string;
  email: string;
  endereco?: string;
  dataNascimento?: string;
  sexo?: string;
  cpf?: string;
  telefone?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginRequest {
  email: string;
  senha: string;
}

interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  endereco?: string;
  dataNascimento?: string;
  sexo?: string;
  cpf?: string;
  telefone?: string;
}

interface SavedRoute {
  id: string;
  usuarioId: string;
  nome: string;
  descricao?: string;
  preco: number;
  aeroportos: string[];
  detalhesAeroportos?: Array<{
    codigo: string;
    nome: string;
    cidade: string;
    estado: string;
    imagemUrl: string;
  }>;
  ativa: boolean;
  createdAt: string;
  updatedAt: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
  };
  trechos?: RouteSegment[];
  resumo?: {
    totalAeroportos: number;
    totalTrechos: number;
    precoTotal: number;
  };
}

interface SaveRouteRequest {
  usuarioId: string;
  nome: string;
  descricao?: string;
  aeroportos: string[];
}

const handleResponse = async <T>(
  response: Response
): Promise<ApiResponse<T>> => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Erro: ${response.status}`);
  }
  if (data.success === false) {
    throw new Error(data.message || "Operação falhou");
  }
  return data;
};

export const api = {
  async getAllAirports(): Promise<ApiResponse<Airport[]>> {
    const response = await fetch(`${API_URL}/aeroportos`);
    return handleResponse<Airport[]>(response);
  },

  async getAirportByCode(codigo: string): Promise<ApiResponse<AirportDetails>> {
    const response = await fetch(
      `${API_URL}/aeroportos/detalhes/${codigo.toUpperCase()}`
    );
    return handleResponse<AirportDetails>(response);
  },

  async getAirportsByState(estado: string): Promise<ApiResponse<Airport[]>> {
    const response = await fetch(
      `${API_URL}/aeroportos/estado/${estado.toUpperCase()}`
    );
    return handleResponse<Airport[]>(response);
  },

  async getBestRoute(
    origem: string,
    destino: string
  ): Promise<ApiResponse<BestRoute>> {
    const response = await fetch(
      `${API_URL}/melhor-rota/${origem.toUpperCase()}/${destino.toUpperCase()}`
    );
    return handleResponse<BestRoute>(response);
  },

  async getAlternativeRoutes(
    origem: string,
    destino: string,
    maxEscalas: number = 2
  ): Promise<ApiResponse<AlternativeRoutesResponse>> {
    const response = await fetch(
      `${API_URL}/rotas-alternativas/${origem.toUpperCase()}/${destino.toUpperCase()}?maxEscalas=${maxEscalas}`
    );
    return handleResponse<AlternativeRoutesResponse>(response);
  },

  async checkDirectFlight(
    origem: string,
    destino: string
  ): Promise<ApiResponse<DirectFlight>> {
    const response = await fetch(
      `${API_URL}/rotas-voo-direto/${origem.toUpperCase()}/${destino.toUpperCase()}`
    );
    return handleResponse<DirectFlight>(response);
  },

  async registerUser(userData: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_URL}/cadastrar-usuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return handleResponse<User>(response);
  },

  async login(credentials: LoginRequest): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse<User>(response);
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_URL}/usuario/${id}`);
    return handleResponse<User>(response);
  },

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch(`${API_URL}/usuarios`);
    return handleResponse<User[]>(response);
  },

  async updateUser(
    id: string,
    userData: Partial<RegisterRequest>
  ): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_URL}/atualizar-usuario/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return handleResponse<User>(response);
  },

  async saveRoute(
    routeData: SaveRouteRequest
  ): Promise<ApiResponse<SavedRoute>> {
    const response = await fetch(`${API_URL}/salvar-rota`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(routeData),
    });
    return handleResponse<SavedRoute>(response);
  },

  async getUserRoutes(usuarioId: string): Promise<ApiResponse<SavedRoute[]>> {
    const response = await fetch(`${API_URL}/rota-salva/${usuarioId}`);
    return handleResponse<SavedRoute[]>(response);
  },

  async getRouteById(id: string): Promise<ApiResponse<SavedRoute>> {
    const response = await fetch(`${API_URL}/rota-salva/${id}`);
    return handleResponse<SavedRoute>(response);
  },

  async updateRoute(
    id: string,
    routeData: Partial<Omit<SaveRouteRequest, "usuarioId">>
  ): Promise<ApiResponse<SavedRoute>> {
    const response = await fetch(`${API_URL}/atualizar-rota/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(routeData),
    });
    return handleResponse<SavedRoute>(response);
  },

  async deleteRoute(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/deletar-rota/${id}`, {
      method: "DELETE",
    });
    return handleResponse<void>(response);
  },

  async getAllSavedRoutes(): Promise<ApiResponse<SavedRoute[]>> {
    const response = await fetch(`${API_URL}/rotas-salvas`);
    return handleResponse<SavedRoute[]>(response);
  },

  async healthCheck(): Promise<
    ApiResponse<{ grafoCarregado: boolean; timestamp: string }>
  > {
    const response = await fetch(`${API_URL}/health`);
    return handleResponse<{ grafoCarregado: boolean; timestamp: string }>(
      response
    );
  },

  async shareRoute(
    rotaSalvaId: string,
    publica: boolean = false,
    diasExpiracao?: number
  ): Promise<
    ApiResponse<{
      codigo: string;
      link: string;
      publica: boolean;
      expiraEm?: string;
      createdAt: string;
    }>
  > {
    const body: {
      rotaSalvaId: string;
      publica?: boolean;
      diasExpiracao?: number;
    } = { rotaSalvaId };
    if (publica !== undefined) body.publica = publica;
    if (diasExpiracao !== undefined) body.diasExpiracao = diasExpiracao;

    const response = await fetch(`${API_URL}/compartilhar-rota`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async getSharedRoute(codigo: string): Promise<
    ApiResponse<{
      compartilhamento: {
        codigo: string;
        publica: boolean;
        visualizacoes: number;
        createdAt: string;
      };
      rota: SavedRoute;
      criadoPor: {
        id: string;
        nome: string;
      };
    }>
  > {
    const response = await fetch(`${API_URL}/rota/${codigo}`);
    return handleResponse(response);
  },

  async saveSharedRoute(
    codigo: string,
    usuarioId: string,
    nome?: string,
    descricao?: string
  ): Promise<ApiResponse<SavedRoute>> {
    const response = await fetch(`${API_URL}/salvar-rota-compartilhada`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codigo,
        usuarioId,
        nome,
        descricao,
      }),
    });
    return handleResponse<SavedRoute>(response);
  },
};
