import { Link, useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Scene3D } from "./Scene3D";
import { Button } from "@/components/ui/button";
import { Plane, Route, Save, Search } from "lucide-react";

export const LandingPage = () => {
  const navigate = useNavigate();

  const handleBuscarVoos = () => {
    const isLoggedIn = localStorage.getItem("facilitavoos_is_logged_in") === "true";
    const userId = localStorage.getItem("facilitavoos_user_id");
    
    if (isLoggedIn && userId) {
      navigate("/escolha-viagem");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 text-slate-900">
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="size-5 md:size-6 text-blue-600" />
            <span className="text-xl md:text-2xl font-bold text-slate-900">
              FacilitaVoos
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/sobre">
              <Button
                variant="ghost"
                className="hidden md:inline-flex text-slate-700 hover:text-blue-600 text-sm"
              >
                Sobre
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-xs md:text-sm px-3 md:px-4"
              >
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
            <Scene3D />
          </Canvas>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-slate-900 drop-shadow-lg">
            FacilitaVoos
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-slate-900 max-w-3xl mx-auto font-medium drop-shadow-md">
            Encontre as melhores rotas aéreas entre os principais aeroportos da
            LATAM com tecnologia de Teoria de Grafos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleBuscarVoos}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 shadow-lg"
            >
              <Search className="size-5 mr-2" />
              Buscar Voos
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-lg px-8 py-6 shadow-lg"
            >
              Saiba Mais
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-slate-600 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Funcionalidades
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white backdrop-blur-sm p-8 rounded-lg border border-slate-200 hover:border-blue-500 transition-all shadow-lg">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Route className="size-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-slate-900">
                Rotas Inteligentes
              </h3>
              <p className="text-slate-600">
                Utilizamos Teoria de Grafos para encontrar a melhor rota entre
                aeroportos, considerando escalas quando necessário para otimizar
                seu tempo e custo.
              </p>
            </div>

            <div className="bg-white backdrop-blur-sm p-8 rounded-lg border border-slate-200 hover:border-blue-500 transition-all shadow-lg">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Search className="size-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-slate-900">Busca Avançada</h3>
              <p className="text-slate-600">
                Pesquise voos entre os principais aeroportos utilizados pela
                LATAM, com resultados instantâneos e precisos.
              </p>
            </div>

            <div className="bg-white backdrop-blur-sm p-8 rounded-lg border border-slate-200 hover:border-blue-500 transition-all shadow-lg">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <Save className="size-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-slate-900">Salvar Rotas</h3>
              <p className="text-slate-600">
                Salve suas rotas favoritas para consultas futuras. Todas as
                informações são armazenadas com segurança no nosso banco de
                dados.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white backdrop-blur-sm p-12 rounded-lg border border-slate-200 shadow-lg">
            <h2 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Sobre o Projeto
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-6 text-center">
              O FacilitaVoos é uma aplicação inovadora para pesquisa de voos
              entre os aeroportos mais utilizados pela companhia LATAM. Nossa
              plataforma utiliza conceitos avançados de{" "}
              <strong className="text-blue-600">Teoria de Grafos</strong> para
              traçar a melhor rota para seu destino final, podendo utilizar
              escalas entre aeroportos quando necessário.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed text-center">
              Além disso, você pode salvar suas rotas favoritas para consultas
              futuras. Todas as informações são armazenadas de forma segura em
              nosso banco de dados, garantindo que você tenha acesso rápido às
              suas rotas salvas sempre que precisar.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-8 bg-white/90 backdrop-blur-sm border-t border-slate-200">
        <div className="container mx-auto px-6 text-center text-slate-600">
          <p>&copy; 2024 FacilitaVoos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};





