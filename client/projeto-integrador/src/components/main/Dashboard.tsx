import { Trash2, X, Plane, Sparkles, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  selectedAirports: string[];
  airports: any[];
  onRemove: (code: string) => void;
  onClear: () => void;
  onSaveRoute: () => void;
  totalPrice: number;
  bestRouteMode: boolean;
  onToggleBestRouteMode: (enabled: boolean) => void;
  bestRouteData?: any;
  isEditing?: boolean;
  routeName?: string;
  routeDescription?: string;
  onRouteNameChange?: (name: string) => void;
  onRouteDescriptionChange?: (description: string) => void;
}

export const Dashboard = ({
  selectedAirports,
  airports,
  onRemove,
  onClear,
  onSaveRoute,
  totalPrice,
  bestRouteMode,
  onToggleBestRouteMode,
  bestRouteData,
  isEditing = false,
  routeName = "",
  routeDescription = "",
  onRouteNameChange,
  onRouteDescriptionChange,
}: DashboardProps) => {
  const selectedAirportsData = selectedAirports
    .map((code) => airports.find((a) => a.codigo === code))
    .filter((a) => a !== undefined);

  return (
    <div className="h-full flex flex-col">
      <div className="hidden md:block p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditing ? "Editar Rota" : "Minha Rota"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBestRouteMode(!bestRouteMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                bestRouteMode
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="size-4" />
              Melhor Rota
            </button>
            {selectedAirports.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="size-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-600">
          {bestRouteMode
            ? selectedAirports.length === 0
              ? "Selecione origem e destino para encontrar a melhor rota"
              : selectedAirports.length === 1
              ? "Selecione o destino"
              : "Melhor rota calculada"
            : selectedAirports.length === 0
            ? "Nenhum aeroporto selecionado"
            : `${selectedAirports.length} aeroporto${
                selectedAirports.length > 1 ? "s" : ""
              } na rota`}
        </p>
        {bestRouteMode && bestRouteData && (
          <p className="text-xs text-blue-600 mt-1">
            {bestRouteData.resumo.escalas === 0
              ? "Voo direto"
              : `${bestRouteData.resumo.escalas} escala${
                  bestRouteData.resumo.escalas > 1 ? "s" : ""
                }`}
          </p>
        )}
        {isEditing && (
          <div className="mt-4 space-y-3 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Nome da Rota *
              </label>
              <input
                type="text"
                value={routeName}
                onChange={(e) => onRouteNameChange?.(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
                placeholder="Digite o nome da rota"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Descrição
              </label>
              <textarea
                value={routeDescription}
                onChange={(e) => onRouteDescriptionChange?.(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 resize-none"
                placeholder="Digite uma descrição (opcional)"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => onToggleBestRouteMode(!bestRouteMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              bestRouteMode
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Sparkles className="size-4" />
            Melhor Rota
          </button>
          {selectedAirports.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="size-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
        <p className="text-sm text-slate-600">
          {bestRouteMode
            ? selectedAirports.length === 0
              ? "Selecione origem e destino"
              : selectedAirports.length === 1
              ? "Selecione o destino"
              : "Melhor rota calculada"
            : selectedAirports.length === 0
            ? "Nenhum aeroporto selecionado"
            : `${selectedAirports.length} aeroporto${
                selectedAirports.length > 1 ? "s" : ""
              } na rota`}
        </p>
        {bestRouteMode && bestRouteData && (
          <p className="text-xs text-blue-600 mt-1">
            {bestRouteData.resumo.escalas === 0
              ? "Voo direto"
              : `${bestRouteData.resumo.escalas} escala${
                  bestRouteData.resumo.escalas > 1 ? "s" : ""
                }`}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {bestRouteMode && selectedAirports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in-50 duration-300">
            <div className="relative mb-4">
              <Sparkles className="size-16 text-blue-200" />
              <Sparkles className="size-16 text-blue-600 absolute inset-0 animate-pulse" />
            </div>
            <p className="text-slate-700 font-semibold mb-2">
              Modo Melhor Rota ativado
            </p>
            <p className="text-sm text-slate-500 max-w-xs">
              Selecione origem e destino para encontrar a melhor rota com menor
              preço
            </p>
          </div>
        ) : selectedAirportsData.length === 0 && !bestRouteData?.rota ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in-50 duration-300">
            <Plane className="size-16 text-slate-300 mb-4 animate-bounce" />
            <p className="text-slate-700 font-semibold mb-2">
              Nenhum aeroporto selecionado
            </p>
            <p className="text-sm text-slate-500 max-w-xs">
              Clique em um marcador no mapa para adicionar à sua rota
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(bestRouteMode && bestRouteData?.rota
              ? bestRouteData.rota
              : selectedAirportsData
            ).map((airport: any, index: number) => {
              const animationDelay = index * 50;
              const isBestRoute = bestRouteMode && bestRouteData?.rota;
              const airportCode = isBestRoute ? airport.codigo : airport.codigo;
              const airportName = isBestRoute ? airport.nome : airport.nome;
              const airportCity = isBestRoute
                ? `${airport.cidade}${
                    airport.estado ? `, ${airport.estado}` : ""
                  }`
                : `${airport.localizacao?.cidade || ""}, ${
                    airport.localizacao?.pais || ""
                  }`;
              const isFromBestRoute =
                isBestRoute &&
                index > 0 &&
                index < bestRouteData.rota.length - 1;
              const totalAirports = isBestRoute
                ? bestRouteData.rota.length
                : selectedAirportsData.length;

              return (
                <div
                  key={
                    bestRouteData?.rota
                      ? `${airportCode}-${index}`
                      : airport.id || airport.codigo
                  }
                  className={`bg-slate-50 rounded-lg p-4 border transition-all duration-200 animate-in fade-in-0 slide-in-from-left-4 ${
                    isFromBestRoute
                      ? "border-yellow-300 bg-yellow-50/50 shadow-sm"
                      : "border-slate-200 hover:border-blue-300 hover:shadow-md"
                  }`}
                  style={{ animationDelay: `${animationDelay}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold text-slate-900">
                          {airportName}
                        </h3>
                        {isFromBestRoute && (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                            Escala
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 ml-8">
                        {airportCity}
                      </p>
                      <p className="text-xs text-blue-600 font-medium ml-8">
                        Código: {airportCode}
                      </p>
                    </div>
                    {!bestRouteMode && (
                      <button
                        onClick={() => onRemove(airportCode)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                        aria-label="Remover"
                      >
                        <X className="size-4 text-red-600" />
                      </button>
                    )}
                  </div>
                  {index < totalAirports - 1 && (
                    <div className="flex items-center gap-2 ml-8 mb-2">
                      <div className="w-0.5 h-6 bg-blue-400"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Plane className="size-3" />
                          <span>Voando para próximo destino</span>
                        </div>
                        {bestRouteData?.trechos?.[index] && (
                          <p className="text-sm font-medium text-slate-700 mt-1">
                            R${" "}
                            {bestRouteData.trechos[index].preco.toLocaleString(
                              "pt-BR",
                              { minimumFractionDigits: 2 }
                            )}
                          </p>
                        )}
                        {!bestRouteData &&
                          airport.voosDisponiveis?.find(
                            (voo: any) =>
                              voo.codigo ===
                              selectedAirportsData[index + 1]?.codigo
                          ) && (
                            <p className="text-sm font-medium text-slate-700 mt-1">
                              R${" "}
                              {airport.voosDisponiveis
                                .find(
                                  (voo: any) =>
                                    voo.codigo ===
                                    selectedAirportsData[index + 1]?.codigo
                                )
                                ?.preco.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                }) || "0,00"}
                            </p>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedAirports.length > 0 && (
        <div className="p-6 border-t border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-700 font-medium">
              Total da rota:
            </span>
            <span className="text-3xl font-bold text-slate-900">
              R${" "}
              {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-600">
              {bestRouteMode && bestRouteData?.resumo
                ? `${bestRouteData.resumo.totalTrechos} trecho${
                    bestRouteData.resumo.totalTrechos > 1 ? "s" : ""
                  } • ${bestRouteData.resumo.escalas} escala${
                    bestRouteData.resumo.escalas > 1 ? "s" : ""
                  }`
                : `${selectedAirports.length - 1} trecho${
                    selectedAirports.length - 1 !== 1 ? "s" : ""
                  } de voo`}
            </p>
            {bestRouteMode && bestRouteData?.resumo && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                Melhor preço
              </span>
            )}
          </div>
          <Button
            onClick={onSaveRoute}
            disabled={isEditing && !routeName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? (
              <>
                <Edit2 className="size-4 mr-2" />
                Atualizar Rota
              </>
            ) : (
              "Salvar Rota"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
