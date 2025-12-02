import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Plane, ArrowLeft, Calendar, MapPin, Save, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
import { MapController } from "./MapController";
import { Loader2 } from "lucide-react";

const customIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const SharedRoutePage = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const [sharedRouteData, setSharedRouteData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [airports, setAirports] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem("facilitavoos_is_logged_in") === "true";
      const id = localStorage.getItem("facilitavoos_user_id");
      setIsLoggedIn(loggedIn);
      setUserId(id);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchSharedRoute = async () => {
      if (!codigo) return;

      try {
        setIsLoading(true);
        const response = await api.getSharedRoute(codigo);
        
        if (response.success && response.data) {
          setSharedRouteData(response.data);
          
          const allAirportsResponse = await api.getAllAirports();
          if (allAirportsResponse.success && allAirportsResponse.data) {
            setAirports(allAirportsResponse.data);
          }
        } else if (response.success === false) {
          toast.error(response.message || "Rota compartilhada não encontrada");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao carregar rota compartilhada"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedRoute();
  }, [codigo]);

  const handleSaveRoute = async () => {
    if (!codigo || !userId) {
      toast.error("Faça login para salvar esta rota");
      navigate("/login");
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.saveSharedRoute(codigo, userId);
      
      if (response.success && response.data) {
        toast.success("Rota salva com sucesso na sua conta!");
        setTimeout(() => {
          navigate("/rotas-salvas");
        }, 1000);
      } else if (response.success === false) {
        toast.error(response.message || "Erro ao salvar rota");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar rota");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    const fullUrl = window.location.href;
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getRouteCoordinates = () => {
    if (!sharedRouteData?.rota?.aeroportos || !airports.length) return [];
    
    return sharedRouteData.rota.aeroportos
      .map((code: string) => {
        const airport = airports.find((a) => a.codigo === code);
        return airport ? [airport.localizacao.latitude, airport.localizacao.longitude] : null;
      })
      .filter((coord: any) => coord !== null) as [number, number][];
  };

  const mapBounds = () => {
    if (!airports.length || !sharedRouteData?.rota?.aeroportos) {
      return new LatLngBounds([-35, -80], [10, -30]);
    }
    
    const routeAirports = sharedRouteData.rota.aeroportos
      .map((code: string) => airports.find((a) => a.codigo === code))
      .filter((a: any) => a !== undefined);
    
    if (routeAirports.length === 0) {
      return new LatLngBounds([-35, -80], [10, -30]);
    }
    
    const lats = routeAirports.map((a: any) => a.localizacao.latitude);
    const lons = routeAirports.map((a: any) => a.localizacao.longitude);
    const minLat = Math.min(...lats) - 5;
    const maxLat = Math.max(...lats) + 5;
    const minLon = Math.min(...lons) - 5;
    const maxLon = Math.max(...lons) + 5;
    return new LatLngBounds([minLat, minLon], [maxLat, maxLon]);
  };

  const getAirportInfo = (code: string) => {
    const apiAirport = sharedRouteData?.rota?.detalhesAeroportos?.find(
      (a: any) => a.codigo === code
    );
    const fullAirport = airports.find((a) => a.codigo === code);

    return {
      name: apiAirport?.nome || fullAirport?.nome || code,
      city: apiAirport?.cidade || fullAirport?.localizacao?.cidade || "",
      state: apiAirport?.estado || fullAirport?.localizacao?.estado || "",
      image: apiAirport?.imagemUrl || fullAirport?.imagemUrl || "",
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Carregando rota compartilhada...</p>
        </div>
      </div>
    );
  }

  if (!sharedRouteData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Plane className="size-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Rota não encontrada
          </h2>
          <p className="text-slate-600 mb-6">
            Esta rota compartilhada não existe ou foi desativada.
          </p>
          <Link to="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Voltar ao início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const route = sharedRouteData.rota;
  const routeCoords = getRouteCoordinates();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="size-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Plane className="size-5 md:size-6 text-blue-600" />
            <span className="text-xl md:text-2xl font-bold text-slate-900">
              FacilitaVoos
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Link to="/rotas-salvas">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 text-xs md:text-sm"
              >
                Acessar Rotas
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 text-xs md:text-sm"
              >
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {route.nome}
              </h1>
              {route.descricao && (
                <p className="text-slate-600">{route.descricao}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  <span>Criada em {new Date(route.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                {sharedRouteData.criadoPor && (
                  <div className="flex items-center gap-1">
                    <span>por {sharedRouteData.criadoPor.nome}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="text-slate-600 border-slate-300 hover:bg-slate-50"
              >
                {isCopied ? (
                  <>
                    <Check className="size-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="size-4 mr-2" />
                    Copiar Link
                  </>
                )}
              </Button>
              {isLoggedIn && userId && (
                <Button
                  onClick={handleSaveRoute}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="size-4 mr-2" />
                      Salvar na Minha Conta
                    </>
                  )}
                </Button>
              )}
              {!isLoggedIn && (
                <Link to={`/login?sharedRoute=${codigo}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="size-4 mr-2" />
                    Fazer Login para Salvar
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-600 mb-1">Preço Total</p>
              <p className="text-2xl font-bold text-slate-900">
                R$ {route.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-600 mb-1">Aeroportos</p>
              <p className="text-xl font-semibold text-slate-900">
                {route.aeroportos.length}
              </p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-600 mb-1">Trechos</p>
              <p className="text-xl font-semibold text-slate-900">
                {route.aeroportos.length - 1}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Rota no Mapa</h2>
            <div className="h-96 rounded-lg overflow-hidden border border-slate-200">
              <MapContainer
                center={[-15, -50]}
                zoom={3}
                minZoom={2}
                maxZoom={10}
                maxBounds={mapBounds()}
                maxBoundsViscosity={0.2}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController bounds={mapBounds()} minZoom={2} />
                
                {route.aeroportos.map((code: string) => {
                  const airport = airports.find((a) => a.codigo === code);
                  if (!airport) return null;
                  return (
                    <Marker
                      key={code}
                      position={[airport.localizacao.latitude, airport.localizacao.longitude]}
                      icon={customIcon}
                    />
                  );
                })}

                {routeCoords.length >= 2 && (
                  <Polyline
                    positions={routeCoords}
                    pathOptions={{ 
                      color: "#3b82f6", 
                      weight: 3, 
                      opacity: 0.8
                    }}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Detalhes da Rota</h2>
            <div className="space-y-4">
              {route.aeroportos.map((code: string, index: number) => {
                const airportInfo = getAirportInfo(code);
                const segment = route.trechos?.[index];
                return (
                  <div key={code} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                        <img
                          src={airportInfo.image}
                          alt={airportInfo.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                            {index + 1}
                          </span>
                          <h3 className="font-semibold text-slate-900">{airportInfo.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 ml-8">
                          <MapPin className="size-3" />
                          <span>
                            {airportInfo.city}
                            {airportInfo.state && `, ${airportInfo.state}`}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 font-medium ml-8 mt-1">
                          Código: {code}
                        </p>
                        {segment && index < route.aeroportos.length - 1 && (
                          <p className="text-sm text-slate-500 ml-8 mt-2">
                            Preço do trecho: R${" "}
                            {segment.preco.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    {index < route.aeroportos.length - 1 && (
                      <div className="flex items-center ml-10 mt-2 mb-2">
                        <div className="w-0.5 h-6 bg-blue-300"></div>
                        <Plane className="size-4 text-blue-500 ml-2" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

