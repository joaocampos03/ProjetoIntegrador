import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const sharedRouteCode = searchParams.get("sharedRoute");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const senha = formData.get("password") as string;

    try {
      const response = await api.login({ email, senha });
      if (response.success && response.data) {
        localStorage.setItem("facilitavoos_is_logged_in", "true");
        localStorage.setItem("facilitavoos_user_id", response.data.id);
        localStorage.setItem("facilitavoos_user_name", response.data.nome);
        
        if (sharedRouteCode) {
          try {
            const saveResponse = await api.saveSharedRoute(sharedRouteCode, response.data.id);
            if (saveResponse.success) {
              toast.success("Rota salva com sucesso na sua conta!");
              navigate("/rotas-salvas");
            } else {
              toast.error(saveResponse.message || "Erro ao salvar rota compartilhada");
              navigate("/rotas-salvas");
            }
          } catch (saveError) {
            toast.error("Erro ao salvar rota compartilhada");
            navigate("/rotas-salvas");
          }
        } else {
          toast.success("Login realizado com sucesso!");
          navigate("/escolha-viagem");
        }
      } else if (response.success === false) {
        toast.error(response.message || "Erro ao fazer login");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Form Section */}
      <div className="w-full md:w-1/3 bg-white shadow-2xl flex items-center justify-center min-h-screen md:h-full">
        <div className="w-full max-w-md px-6 md:px-12 py-12 md:py-16 rounded-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Plane className="size-6 md:size-8 text-blue-600" />
              <span className="text-2xl md:text-3xl font-bold text-slate-900">
                FacilitaVoos
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              Entre na sua conta para continuar
            </p>
          </div>

          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Senha
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
                />
                <span className="ml-2 text-sm text-slate-600">Lembrar-me</span>
              </label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Esqueceu a senha?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 md:py-6 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Não tem uma conta?{" "}
                <Link
                  to={sharedRouteCode ? `/register?sharedRoute=${sharedRouteCode}` : "/register"}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Image Section */}
      <div
        className="hidden md:flex w-full md:w-2/3 bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1719472196370-1b7eda2cf61f?q=80&w=1071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative h-full w-full flex flex-col justify-center items-center text-white text-center">
          <div className="w-full max-w-3xl px-6 md:px-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 drop-shadow-lg">
              Encontre as melhores rotas aéreas
            </h1>
            <p className="text-base md:text-xl drop-shadow-md">
              Utilize nossa plataforma avançada para descobrir as rotas mais
              eficientes entre os principais aeroportos da LATAM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
