import { X, Plus, Cloud, Thermometer, Droplets, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getWeather } from "@/lib/weather";
import { toast } from "sonner";

interface AirportDetailsProps {
  airportCode: string;
  airportData?: any;
  onClose: () => void;
  onAddToRoute: () => void;
  canAddToRoute?: boolean;
  cannotAddReason?: string;
}

export const AirportDetails = ({
  airportCode,
  airportData,
  onClose,
  onAddToRoute,
  canAddToRoute = true,
  cannotAddReason,
}: AirportDetailsProps) => {
  const [airportDetails, setAirportDetails] = useState<any>(
    airportData || null
  );
  const [isLoading, setIsLoading] = useState(!airportData);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  useEffect(() => {
    if (airportData) {
      setAirportDetails(airportData);
      setIsLoading(false);
    } else {
      const fetchDetails = async () => {
        try {
          setIsLoading(true);
          const response = await api.getAirportByCode(airportCode);
          if (response.success && response.data) {
            setAirportDetails(response.data);
          } else if (response.success === false) {
            toast.error(
              response.message || "Erro ao buscar detalhes do aeroporto"
            );
          }
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Erro ao buscar detalhes do aeroporto"
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetails();
    }
  }, [airportCode, airportData]);

  useEffect(() => {
    const fetchWeather = async () => {
      if (
        !airportDetails?.localizacao?.latitude ||
        !airportDetails?.localizacao?.longitude
      )
        return;

      setIsLoadingWeather(true);
      const weather = await getWeather(
        airportDetails.localizacao.latitude,
        airportDetails.localizacao.longitude
      );
      setWeatherData(weather);
      setIsLoadingWeather(false);
    };

    if (airportDetails) {
      fetchWeather();
    }
  }, [airportDetails]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="size-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (!airportDetails) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center py-8">
          <p className="text-slate-600">Aeroporto não encontrado</p>
        </div>
      </div>
    );
  }

  const displayName = airportDetails.nome;
  const displayCity = airportDetails.localizacao?.cidade || "";
  const displayCountry = airportDetails.localizacao?.pais || "";
  const displayDescription = airportDetails.descricao || "";
  const displayImage = airportDetails.imagemUrl || "";
  const estimatedPrice = airportDetails.voosDisponiveis?.[0]?.preco || 0;

  return (
    <div className="p-4 md:p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-2">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
            {displayName}
          </h2>
          <p className="text-base md:text-lg text-slate-600">
            {displayCity}, {displayCountry}
          </p>
          <p className="text-sm text-blue-600 font-semibold mt-1">
            Código: {airportCode}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
          aria-label="Fechar"
        >
          <X className="size-5 text-slate-600" />
        </button>
      </div>

      <div className="mb-4">
        <div className="relative w-full h-40 md:h-48 rounded-lg mb-4 overflow-hidden bg-slate-200">
          <img
            src={displayImage}
            alt={displayName}
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800";
            }}
          />
        </div>
        <p className="text-sm md:text-base text-slate-700 leading-relaxed">
          {displayDescription}
        </p>
        {airportDetails?.voosDisponiveis &&
          airportDetails.voosDisponiveis.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Voos disponíveis:{" "}
                {airportDetails.totalVoos ||
                  airportDetails.voosDisponiveis.length}
              </p>
              <div className="mt-2 space-y-1">
                {airportDetails.voosDisponiveis
                  .slice(0, 5)
                  .map((voo: any, index: number) => (
                    <div
                      key={index}
                      className="text-xs text-slate-600 flex items-center justify-between"
                    >
                      <span>
                        {voo.codigo} - {voo.cidade}
                      </span>
                      <span className="font-medium">
                        R${" "}
                        {voo.preco.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
                {airportDetails.voosDisponiveis.length > 5 && (
                  <p className="text-xs text-slate-500">
                    +{airportDetails.voosDisponiveis.length - 5} outros destinos
                  </p>
                )}
              </div>
            </div>
          )}
      </div>

      {weatherData && (
        <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Cloud className="size-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Clima Atual</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Thermometer className="size-4 text-red-500" />
              <div>
                <p className="text-xs text-slate-600">Temperatura</p>
                <p className="text-sm font-semibold text-slate-900">
                  {weatherData.temperature}°C
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="size-4 text-slate-600" />
              <div>
                <p className="text-xs text-slate-600">Condição</p>
                <p className="text-sm font-semibold text-slate-900">
                  {weatherData.condition}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="size-4 text-blue-500" />
              <div>
                <p className="text-xs text-slate-600">Umidade</p>
                <p className="text-sm font-semibold text-slate-900">
                  {weatherData.humidity}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="size-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-600">Vento</p>
                <p className="text-sm font-semibold text-slate-900">
                  {weatherData.windSpeed} km/h
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoadingWeather && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="size-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Carregando informações climáticas...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div>
          <p className="text-sm text-slate-600">Preço estimado</p>
          <p className="text-xl md:text-2xl font-bold text-slate-900">
            R${" "}
            {estimatedPrice.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <Button
          onClick={onAddToRoute}
          disabled={!canAddToRoute}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!canAddToRoute ? (
            "Não disponível"
          ) : (
            <>
              <Plus className="size-4 mr-2" />
              Adicionar à rota
            </>
          )}
        </Button>
        {!canAddToRoute && cannotAddReason && (
          <p className="text-xs text-red-600 mt-2 text-center md:text-left">
            {cannotAddReason}
          </p>
        )}
      </div>
    </div>
  );
};
