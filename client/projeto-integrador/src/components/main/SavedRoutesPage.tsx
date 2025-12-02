import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Trash2, ArrowLeft, Calendar, Edit2, Download, Share2, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";

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
  trechos?: Array<{
    origem: string;
    destino: string;
    preco: number;
    frequenciaSemanal: number;
  }>;
  resumo?: {
    totalAeroportos: number;
    totalTrechos: number;
    precoTotal: number;
  };
}

export const SavedRoutesPage = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);
  const [routeDetailsModal, setRouteDetailsModal] = useState<SavedRoute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("facilitavoos_user_name");
    if (name) {
      setUserName(name);
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      const userId = localStorage.getItem("facilitavoos_user_id");
      if (!userId) {
        toast.error("Usuário não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.getUserRoutes(userId);
        if (response.success && response.data) {
          setRoutes(response.data);
        } else if (response.success === false) {
          toast.error(response.message || "Erro ao carregar rotas");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao carregar rotas"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, [navigate]);

  const handleDeleteRoute = async (id: string) => {
    try {
      const response = await api.deleteRoute(id);
      if (response.success) {
        setRoutes(routes.filter((route) => route.id !== id));
        setRouteToDelete(null);
        toast.success("Rota excluída com sucesso!");
      } else if (response.success === false) {
        toast.error(response.message || "Erro ao excluir rota");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir rota"
      );
    }
  };

  const handleEditRoute = (route: SavedRoute) => {
    navigate("/escolha-viagem", {
      state: {
        editingRoute: {
          id: route.id,
          nome: route.nome,
          descricao: route.descricao || "",
          aeroportos: route.aeroportos,
        },
      },
    });
  };

  const handleShareRoute = async (route: SavedRoute) => {
    try {
      setIsSharing(true);
      const response = await api.shareRoute(route.id, false);
      
      if (response.success && response.data) {
        const fullUrl = `${window.location.origin}/rota-compartilhada/${response.data.codigo}`;
        await navigator.clipboard.writeText(fullUrl);
        toast.success("Link copiado para a área de transferência!");
        setRouteDetailsModal(null);
      } else if (response.success === false) {
        toast.error(response.message || "Erro ao compartilhar rota");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao compartilhar rota");
    } finally {
      setIsSharing(false);
    }
  };

  const cleanTextForPDF = (text: string): string => {
    return text
      .replace(/→/g, "->")
      .replace(/←/g, "<-")
      .replace(/⇒/g, "=>")
      .replace(/⇐/g, "<=")
      .replace(/['"]/g, "'");
  };

  const handleExportPDF = (route: SavedRoute) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text("FacilitaVoos - Detalhes da Rota", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Rota: ${cleanTextForPDF(route.nome)}`, 20, yPosition);
    yPosition += 10;

    if (route.descricao) {
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      const cleanDesc = cleanTextForPDF(route.descricao);
      const descLines = doc.splitTextToSize(cleanDesc, pageWidth - 40);
      doc.text(descLines, 20, yPosition);
      yPosition += descLines.length * 5 + 5;
    }

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Aeroportos da Rota:", 20, yPosition);
    yPosition += 10;

    route.aeroportos.forEach((code: string, index: number) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      const airportInfo = getAirportInfo(code, route);
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text(`${index + 1}. ${airportInfo.name} (${code})`, 25, yPosition);
      yPosition += 7;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`${airportInfo.city}${airportInfo.state ? `, ${airportInfo.state}` : ""}`, 25, yPosition);
      yPosition += 7;

      if (index < route.aeroportos.length - 1) {
        const segment = route.trechos?.[index];
        if (segment) {
          doc.setTextColor(0, 0, 0);
          doc.text(`Voo para ${route.aeroportos[index + 1]}: R$ ${segment.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 30, yPosition);
          yPosition += 7;
        }
        yPosition += 3;
      }
    });

    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Resumo da Rota", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.text(`Total de aeroportos: ${route.aeroportos.length}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Total de trechos: ${route.aeroportos.length - 1}`, 20, yPosition);
    yPosition += 7;

    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.text(`Preço Total: R$ ${route.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 20, yPosition);
    yPosition += 10;

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 20, pageHeight - 10);

    doc.save(`rota-${route.nome.replace(/\s+/g, "-")}-${Date.now()}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRouteTitle = (route: SavedRoute) => {
    if (route.nome) {
      return route.nome;
    }
    return route.aeroportos.join(" → ");
  };

  const getAirportInfo = (code: string, route: SavedRoute) => {
    const apiAirport = route.detalhesAeroportos?.find((a) => a.codigo === code);

    return {
      name: apiAirport?.nome || code,
      city: apiAirport?.cidade || "",
      state: apiAirport?.estado || "",
      image: apiAirport?.imagemUrl || "",
    };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/escolha-viagem")}
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="size-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Plane className="size-5 md:size-6 text-blue-600" />
            <span className="text-xl md:text-2xl font-bold text-slate-900">
              FacilitaVoos
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
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
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Rotas Salvas
          </h1>
          <p className="text-slate-600">
            Gerencie suas rotas salvas e visualize seus trajetos planejados
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="size-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium">Carregando rotas...</p>
            </div>
          </div>
        ) : routes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center animate-in fade-in-50 duration-300">
            <div className="relative inline-block mb-4">
              <Plane className="size-16 text-slate-300 mx-auto animate-bounce" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Nenhuma rota salva
            </h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Você ainda não salvou nenhuma rota. Crie uma rota no mapa e
              salve-a para visualizá-la aqui.
            </p>
            <Button
              onClick={() => navigate("/escolha-viagem")}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              Criar Rota
            </Button>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {routes.map((route, index) => (
              <AccordionItem
                key={route.id}
                value={route.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 md:px-6 hover:shadow-md transition-all duration-200 animate-in fade-in-0 slide-in-from-left-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-slate-900 text-base md:text-lg mb-1">
                        {getRouteTitle(route)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="size-4" />
                        <span>{formatDate(route.createdAt)}</span>
                      </div>
                      {route.descricao && (
                        <p className="text-sm text-slate-500 mt-1">
                          {route.descricao}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-lg md:text-xl font-bold text-slate-900">
                        R${" "}
                        {route.preco.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-slate-500 w-full text-center">
                        {route.aeroportos.length - 1} trecho
                        {route.aeroportos.length - 1 !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2 pb-4">
                    <div className="space-y-4">
                      {route.aeroportos.map((code: string, index: number) => {
                        const airportInfo = getAirportInfo(code, route);
                        const segment =
                          index < route.aeroportos.length - 1
                            ? route.trechos?.[index]
                            : null;
                        return (
                          <div key={code} className="relative">
                            <div className="flex items-start gap-4">
                              <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                                <img
                                  src={airportInfo.image}
                                  alt={airportInfo.name}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
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
                                  <h4 className="font-semibold text-slate-900">
                                    {airportInfo.name}
                                  </h4>
                                </div>
                                <p className="text-sm text-slate-600 ml-8">
                                  {airportInfo.city}
                                  {airportInfo.state &&
                                    `, ${airportInfo.state}`}
                                </p>
                                <p className="text-xs text-blue-600 font-medium ml-8 mt-1">
                                  {code}
                                </p>
                                {segment &&
                                  index < route.aeroportos.length - 1 && (
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
                              <div className="flex items-center ml-10 md:ml-12 mt-2 mb-2">
                                <div className="w-0.5 h-6 bg-blue-300"></div>
                                <Plane className="size-4 text-blue-500 ml-2" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-center pt-4 border-t border-slate-200">
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-1">
                          Total da rota:
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          R${" "}
                          {route.preco.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {route.aeroportos.length - 1} trecho
                          {route.aeroportos.length - 1 !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      {isMobile ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRoute(route)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Edit2 className="size-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRouteDetailsModal(route)}
                            className="text-slate-600 border-slate-300 hover:bg-slate-50"
                          >
                            <MoreVertical className="size-4 mr-2" />
                            Mais Detalhes
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportPDF(route)}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <Download className="size-4 mr-2" />
                            Exportar PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRoute(route)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Edit2 className="size-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShareRoute(route)}
                            className="text-purple-600 border-purple-300 hover:bg-purple-50"
                            disabled={isSharing}
                          >
                            <Share2 className="size-4 mr-2" />
                            {isSharing ? "Compartilhando..." : "Compartilhar"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRouteToDelete(route.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="size-4 mr-2" />
                            Excluir Rota
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <AlertDialog
        open={routeToDelete !== null}
        onOpenChange={(open: boolean) => !open && setRouteToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Rota</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta rota? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => routeToDelete && handleDeleteRoute(routeToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {routeDetailsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in-0">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Mais Detalhes</h2>
              <button
                onClick={() => setRouteDetailsModal(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Fechar"
              >
                <X className="size-5 text-slate-600" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-green-600 border-green-300 hover:bg-green-50"
                onClick={() => {
                  handleExportPDF(routeDetailsModal);
                  setRouteDetailsModal(null);
                }}
              >
                <Download className="size-4 mr-2" />
                Exportar PDF
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-purple-600 border-purple-300 hover:bg-purple-50"
                onClick={() => handleShareRoute(routeDetailsModal)}
                disabled={isSharing}
              >
                <Share2 className="size-4 mr-2" />
                {isSharing ? "Compartilhando..." : "Compartilhar"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => {
                  setRouteToDelete(routeDetailsModal.id);
                  setRouteDetailsModal(null);
                }}
              >
                <Trash2 className="size-4 mr-2" />
                Excluir Rota
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
