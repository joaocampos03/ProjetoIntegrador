import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, ArrowLeft, Code, Server, Database, GitBranch } from "lucide-react";

export const SobrePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="size-5 md:size-6 text-blue-600" />
            <span className="text-xl md:text-2xl font-bold text-slate-900">
              FacilitaVoos
            </span>
          </div>
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
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Sobre o Projeto
          </h1>
          <p className="text-center text-slate-600 mb-12 text-lg">
            Conheça a equipe por trás do FacilitaVoos
          </p>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="bg-white rounded-lg p-8 shadow-lg border border-slate-200 hover:border-blue-500 transition-all">
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                  <Code className="size-16 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Guilherme Santos
                </h2>
                <p className="text-blue-600 font-semibold mb-4">Frontend Developer</p>
              </div>
              <p className="text-slate-700 mb-6 text-center">
                Responsável pelo desenvolvimento da interface do usuário, experiência do usuário e integração com a API.
              </p>
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-900 mb-2">Tecnologias:</p>
                <div className="flex flex-wrap gap-2">
                  {["React", "TypeScript", "TailwindCSS", "Leaflet", "Vite"].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg border border-slate-200 hover:border-blue-500 transition-all">
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                  <Server className="size-16 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  João Campos
                </h2>
                <p className="text-green-600 font-semibold mb-4">Backend Developer</p>
              </div>
              <p className="text-slate-700 mb-6 text-center">
                Desenvolveu a arquitetura do backend, implementação de endpoints da API e lógica de negócio.
              </p>
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-900 mb-2">Tecnologias:</p>
                <div className="flex flex-wrap gap-2">
                  {["Node.js", "Express", "MongoDB", "REST API"].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg border border-slate-200 hover:border-blue-500 transition-all">
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                  <Database className="size-16 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Kevin Molinari
                </h2>
                <p className="text-purple-600 font-semibold mb-4">Backend Developer</p>
              </div>
              <p className="text-slate-700 mb-6 text-center">
                Trabalhou na implementação de algoritmos de otimização de rotas, banco de dados e integração de sistemas.
              </p>
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-900 mb-2">Tecnologias:</p>
                <div className="flex flex-wrap gap-2">
                  {["Node.js", "Express", "MongoDB", "Graph Theory"].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-white rounded-lg p-8 md:p-12 shadow-lg border border-slate-200">
            <div className="flex items-center justify-center mb-6">
              <GitBranch className="size-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-slate-900">Sobre o Projeto</h2>
            </div>
            <p className="text-slate-700 leading-relaxed text-center max-w-3xl mx-auto">
              O FacilitaVoos é uma aplicação inovadora desenvolvida como projeto integrador, 
              utilizando conceitos avançados de <strong className="text-blue-600">Teoria de Grafos</strong> para 
              encontrar as melhores rotas aéreas entre os principais aeroportos da LATAM. 
              A plataforma oferece uma experiência completa para pesquisa, planejamento e 
              salvamento de rotas de voo, combinando tecnologia de ponta com uma interface 
              intuitiva e moderna.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white/90 backdrop-blur-sm border-t border-slate-200 py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-slate-600">
          <p>&copy; 2024 FacilitaVoos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

