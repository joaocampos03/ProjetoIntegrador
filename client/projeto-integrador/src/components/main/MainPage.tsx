import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
import { AirportDetails } from "./AirportDetails";
import { Dashboard } from "./Dashboard";
import { MapController } from "./MapController";
import { Plane, Menu, X as XIcon, Search, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";

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

const selectedIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const availableIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const unavailableIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);
  const [selectedAirports, setSelectedAirports] = useState<string[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [routeData, setRouteData] = useState<{
    precoTotal: number;
    trechos: Array<{ origem: string; destino: string; preco: number }>;
  } | null>(null);
  const [airports, setAirports] = useState<any[]>([]);
  const [isLoadingAirports, setIsLoadingAirports] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [bestRouteMode, setBestRouteMode] = useState(false);
  const [bestRouteData, setBestRouteData] = useState<any>(null);
  const [editingRoute, setEditingRoute] = useState<{
    id: string;
    nome: string;
    descricao: string;
    aeroportos: string[];
  } | null>(null);
  const [routeName, setRouteName] = useState<string>("");
  const [routeDescription, setRouteDescription] = useState<string>("");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const name = localStorage.getItem("facilitavoos_user_name");
    if (name) {
      setUserName(name);
    }
  }, []);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        setIsLoadingAirports(true);
        const response = await api.getAllAirports();
        if (response.success && response.data) {
          setAirports(response.data);
        } else if (response.success === false) {
          toast.error(response.message || "Erro ao carregar aeroportos");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao carregar aeroportos"
        );
      } finally {
        setIsLoadingAirports(false);
      }
    };

    fetchAirports();
  }, []);

  useEffect(() => {
    if (location.state && (location.state as any).editingRoute) {
      const route = (location.state as any).editingRoute;
      setEditingRoute(route);
      setRouteName(route.nome);
      setRouteDescription(route.descricao || "");
      setSelectedAirports(route.aeroportos);
      setShowDashboard(true);
    }
  }, [location.state]);

  useEffect(() => {
    const calculateRoute = async () => {
      if (selectedAirports.length < 2) {
        setRouteData(null);
        setBestRouteData(null);
        setIsCalculatingRoute(false);
        return;
      }

      if (bestRouteMode && selectedAirports.length === 2) {
        setIsCalculatingRoute(true);
        try {
          const origem = selectedAirports[0];
          const destino = selectedAirports[1];
          const response = await api.getBestRoute(origem, destino);

          if (response.success && response.data) {
            setBestRouteData(response.data);
            setRouteData({
              precoTotal: response.data.resumo.precoTotal,
              trechos: response.data.trechos,
            });
          } else if (response.success === false) {
            toast.error(response.message || "Erro ao calcular melhor rota");
            setBestRouteData(null);
            setRouteData(null);
          }
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Erro ao calcular melhor rota"
          );
          setBestRouteData(null);
          setRouteData(null);
        } finally {
          setIsCalculatingRoute(false);
        }
        return;
      }

      if (!bestRouteMode) {
        const trechos: Array<{
          origem: string;
          destino: string;
          preco: number;
        }> = [];
        let precoTotal = 0;

        for (let i = 0; i < selectedAirports.length - 1; i++) {
          const origemCodigo = selectedAirports[i];
          const destinoCodigo = selectedAirports[i + 1];

          const origemAirport = airports.find((a) => a.codigo === origemCodigo);

          if (origemAirport) {
            const voo = origemAirport.voosDisponiveis?.find(
              (v: any) => v.codigo === destinoCodigo
            );

            if (voo) {
              const preco = voo.preco;
              trechos.push({
                origem: origemCodigo,
                destino: destinoCodigo,
                preco: preco,
              });
              precoTotal += preco;
            }
          }
        }

        if (trechos.length === selectedAirports.length - 1) {
          setRouteData({ precoTotal, trechos });
        } else {
          setRouteData(null);
        }
        setBestRouteData(null);
      }
    };

    if (airports.length > 0) {
      calculateRoute();
    }
  }, [selectedAirports, airports, bestRouteMode]);

  const mapBounds = useMemo(() => {
    if (airports.length === 0) {
      return new LatLngBounds([-35, -80], [10, -30]);
    }
    const lats = airports.map((a) => a.localizacao.latitude);
    const lons = airports.map((a) => a.localizacao.longitude);
    const minLat = Math.min(...lats) - 30;
    const maxLat = Math.max(...lats) + 30;
    const minLon = Math.min(...lons) - 30;
    const maxLon = Math.max(...lons) + 30;
    return new LatLngBounds([minLat, minLon], [maxLat, maxLon]);
  }, [airports]);

  const handleAirportClick = (code: string) => {
    setSelectedAirport(code);
  };

  const canAddToRoute = (
    code: string
  ): { canAdd: boolean; reason?: string } => {
    if (selectedAirports.length === 0) {
      return { canAdd: true };
    }

    if (bestRouteMode) {
      if (selectedAirports.length >= 2) {
        return {
          canAdd: false,
          reason: "No modo Melhor Rota, selecione apenas origem e destino",
        };
      }
      return { canAdd: true };
    }

    const lastAirportCode = selectedAirports[selectedAirports.length - 1];
    const lastAirport = airports.find((a) => a.codigo === lastAirportCode);

    if (!lastAirport) {
      return { canAdd: false, reason: "Aeroporto anterior não encontrado" };
    }

    const hasDirectFlight = lastAirport.voosDisponiveis?.some(
      (voo: any) => voo.codigo === code
    );

    if (!hasDirectFlight) {
      return {
        canAdd: false,
        reason: `Não há voo direto de ${lastAirportCode} para ${code}`,
      };
    }

    return { canAdd: true };
  };

  const handleAddToRoute = (code: string) => {
    const validation = canAddToRoute(code);
    if (validation.canAdd) {
      if (bestRouteMode && selectedAirports.length === 1) {
        setSelectedAirports([selectedAirports[0], code]);
      } else {
        setSelectedAirports([...selectedAirports, code]);
      }
    } else {
      toast.error(
        validation.reason || "Não é possível adicionar este aeroporto à rota"
      );
    }
  };

  const handleToggleBestRouteMode = (enabled: boolean) => {
    setBestRouteMode(enabled);
    if (enabled) {
      if (selectedAirports.length > 2) {
        setSelectedAirports([
          selectedAirports[0],
          selectedAirports[selectedAirports.length - 1],
        ]);
      } else if (selectedAirports.length === 1) {
        setSelectedAirports([selectedAirports[0]]);
      }
      setBestRouteData(null);
      setRouteData(null);
    } else {
      setBestRouteData(null);
    }
  };

  const handleRemoveFromRoute = (code: string) => {
    setSelectedAirports(selectedAirports.filter((c) => c !== code));
  };

  const handleClearRoute = () => {
    setSelectedAirports([]);
    setRouteData(null);
    setBestRouteData(null);
  };

  const getRouteCoordinates = () => {
    if (bestRouteMode && bestRouteData?.rota) {
      return bestRouteData.rota.map((airport: any) => [
        airport.latitude,
        airport.longitude,
      ]) as [number, number][];
    }

    if (selectedAirports.length < 2) {
      return [];
    }

    const coordinates: [number, number][] = [];

    for (let i = 0; i < selectedAirports.length; i++) {
      const code = selectedAirports[i];
      const airport = airports.find((a) => a.codigo === code);

      if (!airport) continue;

      const coord: [number, number] = [
        airport.localizacao.latitude,
        airport.localizacao.longitude,
      ];

      if (i === 0) {
        coordinates.push(coord);
      } else {
        const previousCode = selectedAirports[i - 1];
        const previousAirport = airports.find((a) => a.codigo === previousCode);

        if (previousAirport) {
          const hasDirectFlight = previousAirport.voosDisponiveis?.some(
            (voo: any) => voo.codigo === code
          );

          if (hasDirectFlight) {
            coordinates.push(coord);
          } else {
            break;
          }
        }
      }
    }

    return coordinates;
  };

  const calculateTotalPrice = () => {
    if (routeData && routeData.precoTotal > 0) {
      return routeData.precoTotal;
    }

    if (selectedAirports.length < 2) return 0;

    let total = 0;
    for (let i = 0; i < selectedAirports.length - 1; i++) {
      const origemCodigo = selectedAirports[i];
      const destinoCodigo = selectedAirports[i + 1];

      const origemAirport = airports.find((a) => a.codigo === origemCodigo);
      const voo = origemAirport?.voosDisponiveis?.find(
        (v: any) => v.codigo === destinoCodigo
      );

      if (voo) {
        total += voo.preco;
      }
    }

    return total;
  };

  const handleSaveRoute = async () => {
    if (selectedAirports.length < 2) return;

    const userId = localStorage.getItem("facilitavoos_user_id");
    if (!userId) {
      toast.error("Usuário não encontrado. Faça login novamente.");
      navigate("/login");
      return;
    }

    const aeroportosParaSalvar =
      bestRouteMode && bestRouteData?.rota
        ? bestRouteData.rota.map((a: any) => a.codigo)
        : selectedAirports;

    const nomeRota =
      routeName.trim() ||
      (bestRouteMode && bestRouteData?.rota
        ? `Melhor Rota ${bestRouteData.rota[0].codigo} → ${
            bestRouteData.rota[bestRouteData.rota.length - 1].codigo
          }`
        : `Rota ${selectedAirports.join(" → ")}`);

    const descricaoRota =
      routeDescription.trim() ||
      (bestRouteMode && bestRouteData?.rota
        ? `Melhor rota de ${bestRouteData.rota[0].cidade} para ${
            bestRouteData.rota[bestRouteData.rota.length - 1].cidade
          }${
            bestRouteData.resumo.escalas > 0
              ? ` com ${bestRouteData.resumo.escalas} escala${
                  bestRouteData.resumo.escalas > 1 ? "s" : ""
                }`
              : " (voo direto)"
          }`
        : `Rota de ${selectedAirports[0]} para ${
            selectedAirports[selectedAirports.length - 1]
          }`);

    try {
      let response;
      if (editingRoute) {
        response = await api.updateRoute(editingRoute.id, {
          nome: nomeRota,
          descricao: descricaoRota,
          aeroportos: aeroportosParaSalvar,
        });
      } else {
        response = await api.saveRoute({
          usuarioId: userId,
          nome: nomeRota,
          descricao: descricaoRota,
          aeroportos: aeroportosParaSalvar,
        });
      }

      if (response.success) {
        setSelectedAirports([]);
        setRouteData(null);
        setBestRouteData(null);
        setEditingRoute(null);
        setRouteName("");
        setRouteDescription("");
        toast.success(
          editingRoute
            ? "Rota atualizada com sucesso!"
            : "Rota salva com sucesso!"
        );
        setTimeout(() => {
          navigate("/rotas-salvas");
        }, 500);
      } else if (response.success === false) {
        toast.error(
          response.message ||
            (editingRoute ? "Erro ao atualizar rota" : "Erro ao salvar rota")
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : editingRoute
          ? "Erro ao atualizar rota"
          : "Erro ao salvar rota"
      );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 md:mb-0">
          <div className="flex items-center gap-2">
            <Plane className="size-5 md:size-6 text-blue-600" />
            <span className="text-xl md:text-2xl font-bold text-slate-900">
              FacilitaVoos
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/rotas-salvas")}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs md:text-sm"
            >
              Rotas Salvas
            </Button>
            <span className="hidden md:inline text-slate-700 text-sm md:text-base">
              Bem-vindo, {userName || "Usuário"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("facilitavoos_is_logged_in");
                localStorage.removeItem("facilitavoos_user_id");
                localStorage.removeItem("facilitavoos_user_name");
                navigate("/");
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs md:text-sm"
            >
              Sair
            </Button>
          </div>
        </div>
        <div className="md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar aeroporto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Limpar busca"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 mt-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar aeroporto por código, nome ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Limpar busca"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <MapPin className="size-4" />
              <span>{airports.length} aeroportos</span>
            </div>
            {selectedAirports.length > 0 && (
              <div className="flex items-center gap-1">
                <Plane className="size-4" />
                <span>
                  {selectedAirports.length} selecionado
                  {selectedAirports.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="flex-1 relative">
          <MapContainer
            center={[-15, -50]}
            zoom={3}
            minZoom={2}
            maxZoom={10}
            maxBounds={mapBounds}
            maxBoundsViscosity={0.2}
            scrollWheelZoom={true}
            doubleClickZoom={false}
            dragging={true}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
            preferCanvas={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController bounds={mapBounds} minZoom={2} />

            {isLoadingAirports ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-[1000] backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-8 text-blue-600 animate-spin" />
                  <p className="text-slate-600 font-medium">
                    Carregando aeroportos...
                  </p>
                </div>
              </div>
            ) : (
              (() => {
                const filteredAirports = airports.filter((airport) => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    airport.codigo.toLowerCase().includes(query) ||
                    airport.nome.toLowerCase().includes(query) ||
                    airport.localizacao.cidade.toLowerCase().includes(query) ||
                    airport.localizacao.estado.toLowerCase().includes(query)
                  );
                });

                if (searchQuery && filteredAirports.length === 0) {
                  return (
                    <div
                      key="no-results"
                      className="absolute inset-0 flex items-center justify-center bg-white/80 z-[1000] backdrop-blur-sm"
                    >
                      <div className="text-center">
                        <Search className="size-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium mb-1">
                          Nenhum aeroporto encontrado
                        </p>
                        <p className="text-sm text-slate-500">
                          Tente buscar por código, nome ou cidade
                        </p>
                      </div>
                    </div>
                  );
                }

                return filteredAirports.map((airport) => {
                  const isSelected = selectedAirports.includes(airport.codigo);
                  const isAvailable =
                    selectedAirports.length === 0 ||
                    (selectedAirports.length > 0 &&
                      canAddToRoute(airport.codigo).canAdd);

                  let icon = customIcon;
                  if (isSelected) {
                    icon = selectedIcon;
                  } else if (selectedAirports.length > 0) {
                    icon = isAvailable ? availableIcon : unavailableIcon;
                  }

                  return (
                    <Marker
                      key={airport.id}
                      position={[
                        airport.localizacao.latitude,
                        airport.localizacao.longitude,
                      ]}
                      icon={icon}
                      eventHandlers={{
                        click: () => {
                          handleAirportClick(airport.codigo);
                        },
                      }}
                    />
                  );
                });
              })()
            )}

            {(() => {
              const routeCoords = getRouteCoordinates();
              if (
                routeCoords.length >= 2 &&
                ((selectedAirports.length > 1 && !bestRouteMode) ||
                  (bestRouteMode && bestRouteData?.rota))
              ) {
                return (
                  <Polyline
                    positions={routeCoords}
                    pathOptions={{
                      color: bestRouteMode ? "#10b981" : "#3b82f6",
                      weight: bestRouteMode ? 4 : 3,
                      opacity: 0.8,
                      dashArray:
                        bestRouteMode && bestRouteData?.resumo.escalas > 0
                          ? "10, 5"
                          : undefined,
                    }}
                  />
                );
              }
              return null;
            })()}
            {isCalculatingRoute && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
                <Loader2 className="size-4 text-blue-600 animate-spin" />
                <span className="text-sm text-slate-700 font-medium">
                  Calculando melhor rota...
                </span>
              </div>
            )}
          </MapContainer>

          {selectedAirport && (
            <>
              {isMobile && (
                <div
                  className="fixed inset-0 bg-black/50 z-[1500] animate-in fade-in-0"
                  onClick={() => setSelectedAirport(null)}
                />
              )}
              <div
                className={`${
                  isMobile
                    ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md max-h-[90vh] overflow-y-auto"
                    : "absolute top-4 left-4 max-w-md"
                } z-[2000] bg-white rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 duration-200`}
              >
                <AirportDetails
                  airportCode={selectedAirport}
                  airportData={airports.find(
                    (a) => a.codigo === selectedAirport
                  )}
                  onClose={() => setSelectedAirport(null)}
                  onAddToRoute={() => {
                    handleAddToRoute(selectedAirport);
                    setSelectedAirport(null);
                  }}
                  canAddToRoute={canAddToRoute(selectedAirport).canAdd}
                  cannotAddReason={canAddToRoute(selectedAirport).reason}
                />
              </div>
            </>
          )}

          <div className="md:hidden fixed bottom-24 right-4 z-[1000]">
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-colors w-16 h-16 flex items-center justify-center relative"
              aria-label="Ver rota"
            >
              {showDashboard ? (
                <XIcon className="size-6" />
              ) : (
                <>
                  <Menu className="size-6" />
                  {selectedAirports.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {selectedAirports.length}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        <div
          className={`${
            showDashboard ? "translate-x-0" : "translate-x-full"
          } md:translate-x-0 fixed md:relative inset-y-0 right-0 w-full md:w-1/3 bg-white border-l border-slate-200 overflow-y-auto z-[2000] md:z-auto transition-transform duration-300 ease-in-out`}
        >
          <div className="md:hidden p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Minha Rota</h2>
            <button
              onClick={() => setShowDashboard(false)}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <XIcon className="size-5 text-slate-600" />
            </button>
          </div>
          <Dashboard
            selectedAirports={selectedAirports}
            airports={airports}
            onRemove={handleRemoveFromRoute}
            onClear={handleClearRoute}
            onSaveRoute={handleSaveRoute}
            totalPrice={calculateTotalPrice()}
            bestRouteMode={bestRouteMode}
            onToggleBestRouteMode={handleToggleBestRouteMode}
            bestRouteData={bestRouteData}
            isEditing={!!editingRoute}
            routeName={routeName}
            routeDescription={routeDescription}
            onRouteNameChange={setRouteName}
            onRouteDescriptionChange={setRouteDescription}
          />
        </div>

        {showDashboard && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-[1500]"
            onClick={() => setShowDashboard(false)}
          />
        )}
      </div>
    </div>
  );
};
