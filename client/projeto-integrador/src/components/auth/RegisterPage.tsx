import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const sharedRouteCode = searchParams.get("sharedRoute");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const nome = formData.get("name") as string;
    const email = formData.get("email") as string;
    const senha = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const endereco = formData.get("endereco") as string;
    const dataNascimento = formData.get("dataNascimento") as string;
    const sexo = formData.get("sexo") as string;
    const cpf = formData.get("cpf") as string;
    const telefone = formData.get("telefone") as string;

    if (senha !== confirmPassword) {
      toast.error("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      setIsLoading(false);
      return;
    }

    if (nome.length < 3) {
      toast.error("O nome deve ter no mínimo 3 caracteres");
      setIsLoading(false);
      return;
    }

    if (!endereco || !dataNascimento || !sexo || !cpf || !telefone) {
      toast.error("Todos os campos são obrigatórios");
      setIsLoading(false);
      return;
    }

    const cpfLimpo = cpf.replace(/\D/g, "");
    const telefoneLimpo = telefone.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      toast.error("CPF deve conter 11 dígitos");
      setIsLoading(false);
      return;
    }

    const dataNasc = new Date(dataNascimento);
    const hoje = new Date();
    const idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mesAniversario = hoje.getMonth() - dataNasc.getMonth();

    if (
      idade < 18 ||
      (idade === 18 && mesAniversario < 0) ||
      (idade === 18 &&
        mesAniversario === 0 &&
        hoje.getDate() < dataNasc.getDate())
    ) {
      toast.error("Você deve ter no mínimo 18 anos para se cadastrar");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.registerUser({
        nome,
        email,
        senha,
        endereco,
        dataNascimento,
        sexo,
        cpf: cpfLimpo,
        telefone: telefoneLimpo,
      });
      if (response.success && response.data) {
        localStorage.setItem("facilitavoos_is_logged_in", "true");
        localStorage.setItem("facilitavoos_user_id", response.data.id);
        localStorage.setItem("facilitavoos_user_name", response.data.nome);

        if (sharedRouteCode) {
          try {
            const saveResponse = await api.saveSharedRoute(
              sharedRouteCode,
              response.data.id
            );
            if (saveResponse.success) {
              toast.success("Rota salva com sucesso na sua conta!");
              navigate("/rotas-salvas");
            } else {
              toast.error(
                saveResponse.message || "Erro ao salvar rota compartilhada"
              );
              navigate("/rotas-salvas");
            }
          } catch (saveError) {
            toast.error("Erro ao salvar rota compartilhada");
            navigate("/rotas-salvas");
          }
        } else {
          toast.success("Usuário cadastrado com sucesso!");
          navigate("/escolha-viagem");
        }
      } else if (response.success === false) {
        toast.error(response.message || "Erro ao cadastrar usuário");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao cadastrar usuário"
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Form Section */}
      <div className="w-full md:w-1/2 lg:w-2/5 bg-white shadow-2xl flex items-center justify-center min-h-screen md:h-full overflow-y-auto">
        <div className="w-full max-w-2xl px-6 md:px-12 py-12 md:py-16 rounded-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Plane className="size-6 md:size-8 text-blue-600" />
              <span className="text-2xl md:text-3xl font-bold text-slate-900">
                FacilitaVoos
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Criar conta
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              Preencha os dados para começar
            </p>
          </div>

          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Nome completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
                  placeholder="João Silva"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="cpf"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  CPF *
                </label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  required
                  maxLength={14}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
                  placeholder="000.000.000-00"
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 11) {
                      value = value.replace(/(\d{3})(\d)/, "$1.$2");
                      value = value.replace(/(\d{3})(\d)/, "$1.$2");
                      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                      e.target.value = value;
                    }
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="telefone"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Telefone *
                </label>
                <input
                  type="text"
                  id="telefone"
                  name="telefone"
                  required
                  maxLength={15}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
                  placeholder="(11) 98888-7777"
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 11) {
                      value = value.replace(/(\d{2})(\d)/, "($1) $2");
                      value = value.replace(/(\d{5})(\d)/, "$1-$2");
                      e.target.value = value;
                    }
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="dataNascimento"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  id="dataNascimento"
                  name="dataNascimento"
                  required
                  max={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 18)
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="sexo"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Sexo *
                </label>
                <select
                  id="sexo"
                  name="sexo"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
                >
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="endereco"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Endereço *
                </label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
                  placeholder="Rua das Flores, 123"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Senha *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Confirmar senha *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600 mt-1"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-slate-600">
                Eu concordo com os{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  termos de serviço
                </a>{" "}
                e{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  política de privacidade
                </a>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 md:py-6 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-5 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Já tem uma conta?{" "}
                <Link
                  to={
                    sharedRouteCode
                      ? `/login?sharedRoute=${sharedRouteCode}`
                      : "/login"
                  }
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Image Section */}
      <div
        className="hidden md:flex w-full md:w-1/2 lg:w-3/5 bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1719472196370-1b7eda2cf61f?q=80&w=1071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative h-full w-full flex flex-col justify-center items-center text-white text-center">
          <div className="w-full max-w-3xl px-6 md:px-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 drop-shadow-lg">
              Comece sua jornada conosco
            </h1>
            <p className="text-base md:text-xl drop-shadow-md">
              Cadastre-se gratuitamente e tenha acesso a todas as
              funcionalidades para planejar suas viagens com a melhor tecnologia
              de roteamento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
