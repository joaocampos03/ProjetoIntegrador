# 🚀 Guia de Deploy no Vercel

Este guia explica passo a passo como fazer o deploy do frontend FacilitaVoos no Vercel.

## 📋 Pré-requisitos

1. Conta no [Vercel](https://vercel.com) (pode criar gratuitamente)
2. Conta no [GitHub](https://github.com) (ou GitLab/Bitbucket)
3. Projeto já commitado em um repositório Git

## 🔧 Passo a Passo

### 1. Preparar o Repositório Git

Se ainda não tiver um repositório Git:

```bash
# Inicializar repositório (se ainda não tiver)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit - FacilitaVoos Frontend"

# Criar repositório no GitHub e adicionar remote
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

### 2. Criar Conta no Vercel

1. Acesse [https://vercel.com](https://vercel.com)
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"** (ou GitLab/Bitbucket)
4. Autorize o Vercel a acessar seus repositórios

### 3. Fazer Deploy no Vercel

#### Opção A: Via Dashboard (Recomendado para iniciantes)

1. **Acesse o Dashboard do Vercel**
   - Após fazer login, você verá o dashboard
   - Clique em **"Add New..."** → **"Project"**

2. **Importar Repositório**
   - Selecione o repositório do GitHub que contém o projeto
   - Se não aparecer, clique em **"Adjust GitHub App Permissions"** e autorize

3. **Configurar Projeto**
   - **Framework Preset**: O Vercel detectará automaticamente como "Vite"
   - **Root Directory**: Deixe como está (ou `./` se necessário)
   - **Build Command**: `npm run build` (já configurado)
   - **Output Directory**: `dist` (já configurado)
   - **Install Command**: `npm install` (já configurado)

4. **Variáveis de Ambiente (Opcional)**
   - Se quiser usar uma URL de API diferente, adicione:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://facilitavoos-backend.vercel.app` (ou sua URL)
   - Clique em **"Add"** e depois em **"Deploy"**

5. **Aguardar Deploy**
   - O Vercel começará a fazer o build automaticamente
   - Você verá o progresso em tempo real
   - Quando terminar, verá uma mensagem de sucesso

6. **Acessar seu Site**
   - Após o deploy, você receberá uma URL como: `https://seu-projeto.vercel.app`
   - Clique na URL para acessar seu site

#### Opção B: Via CLI (Para usuários avançados)

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Fazer Login**
   ```bash
   vercel login
   ```

3. **Fazer Deploy**
   ```bash
   # Na pasta do projeto
   vercel
   ```

4. **Seguir as instruções**
   - Escolha o escopo (sua conta ou organização)
   - Confirme as configurações
   - O deploy será feito automaticamente

### 4. Configurar Domínio Personalizado (Opcional)

1. No dashboard do Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Siga as instruções para configurar os DNS

## 🔄 Deploy Automático

O Vercel faz deploy automático sempre que você:
- Faz push para a branch `main` (ou `master`)
- Cria um Pull Request

Para desabilitar, vá em **Settings** → **Git** e ajuste as configurações.

## 📝 Variáveis de Ambiente

Se precisar configurar variáveis de ambiente:

1. Vá em **Settings** → **Environment Variables**
2. Adicione as variáveis:
   - `VITE_API_URL`: URL da sua API backend
3. Clique em **Save**
4. Faça um novo deploy para aplicar as mudanças

## 🐛 Troubleshooting

### Erro de Build

Se o build falhar:

1. Verifique os logs no dashboard do Vercel
2. Teste localmente com `npm run build`
3. Verifique se todas as dependências estão no `package.json`

### Erro 404 em Rotas

O arquivo `vercel.json` já está configurado para redirecionar todas as rotas para `index.html` (necessário para React Router).

### Problemas com Assets

Se imagens ou arquivos estáticos não carregarem:

1. Verifique se estão na pasta `public/`
2. Use caminhos relativos: `/imagem.png` em vez de `./imagem.png`

## 📚 Recursos Úteis

- [Documentação do Vercel](https://vercel.com/docs)
- [Guia de Deploy do Vite](https://vercel.com/guides/deploying-vite-with-vercel)
- [Suporte do Vercel](https://vercel.com/support)

## ✅ Checklist Final

- [ ] Repositório Git criado e código commitado
- [ ] Conta no Vercel criada
- [ ] Projeto importado no Vercel
- [ ] Build executado com sucesso
- [ ] Site acessível pela URL fornecida
- [ ] Variáveis de ambiente configuradas (se necessário)

---

**Pronto!** Seu projeto está no ar! 🎉

