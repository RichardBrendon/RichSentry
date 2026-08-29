"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

type Language = "en" | "pt-BR";

const translations: Record<string, string> = {
  "Product": "Produto", "Features": "Recursos", "Pricing": "Preços", "Docs": "Documentação", "Light": "Claro", "Dark": "Escuro",
  "Sign in": "Entrar", "Sign out": "Sair", "Signing out…": "Saindo…", "Start monitoring": "Começar a monitorar", "Open dashboard": "Abrir painel", "View live demo": "Ver demonstração",
  "Infrastructure intelligence, without the noise": "Inteligência de infraestrutura, sem ruído",
  "Know when your services fail.": "Saiba quando seus serviços falharem.", "Before your users do.": "Antes dos seus usuários.",
  "RichSentry continuously watches websites and APIs, confirms real incidents, and gives your team the context to respond with confidence.": "O RichSentry monitora continuamente sites e APIs, confirma incidentes reais e oferece à sua equipe o contexto necessário para agir com confiança.",
  "2-minute setup": "Configuração em 2 minutos", "No credit card": "Sem cartão de crédito", "Secure by default": "Seguro por padrão",
  "Production workspace": "Ambiente de produção", "Live": "Ao vivo", "Overview": "Visão geral", "Monitors": "Monitores", "Incidents": "Incidentes", "Status pages": "Páginas de status", "Settings": "Configurações",
  "Infrastructure": "Infraestrutura", "New monitor": "Novo monitor", "MONITORS": "MONITORES", "operational": "operacionais", "UPTIME · 30D": "DISPONIBILIDADE · 30D", "AVG RESPONSE": "RESPOSTA MÉDIA", "Across all monitors": "Em todos os monitores", "ACTIVE INCIDENTS": "INCIDENTES ATIVOS", "Needs attention": "Requer atenção",
  "Response time": "Tempo de resposta", "Last 24 hours": "Últimas 24 horas", "Authentication Service": "Serviço de autenticação", "Slow response": "Resposta lenta",
  "BUILT FOR RELIABILITY": "CRIADO PARA CONFIABILIDADE", "Everything between “it works” and “we know why.”": "Tudo entre “está funcionando” e “sabemos o motivo”.", "Operational clarity without a maze of configuration.": "Clareza operacional sem um labirinto de configurações.",
  "Website & API monitoring": "Monitoramento de sites e APIs", "HTTP checks from the server, with status-code and latency validation.": "Verificações HTTP pelo servidor, com validação de status e latência.", "Incident confirmation": "Confirmação de incidentes", "Configurable failure and recovery thresholds cut through transient noise.": "Limites configuráveis de falha e recuperação eliminam ruídos temporários.", "Security by default": "Segurança por padrão", "SSRF-safe requests, tenant isolation and protected scheduled jobs.": "Requisições protegidas contra SSRF, isolamento por organização e tarefas protegidas.", "Alerts that travel": "Alertas onde você precisar", "A delivery pipeline ready for signed webhooks, email and future integrations.": "Uma estrutura pronta para webhooks assinados, e-mail e futuras integrações.", "Explore feature": "Explorar recurso",
  "HOW IT WORKS": "COMO FUNCIONA", "Add your endpoint": "Adicione seu endpoint", "Choose a URL, interval, expected status and response threshold.": "Escolha uma URL, intervalo, status esperado e limite de resposta.", "We monitor it": "Nós monitoramos", "Checks run securely on the server and every result becomes usable history.": "As verificações são executadas com segurança e cada resultado compõe o histórico.", "Act on signal": "Aja com informação", "Confirmed failures create incidents and notify the right people.": "Falhas confirmadas criam incidentes e notificam as pessoas certas.",
  "SIMPLE PRICING": "PREÇOS SIMPLES", "Start small. Stay informed.": "Comece pequeno. Fique informado.", "Free": "Grátis", "For side projects": "Para projetos pessoais", "For production teams": "Para equipes de produção", "For growing organizations": "Para organizações em crescimento", "POPULAR": "POPULAR",
  "WELCOME": "BEM-VINDO", "Access your monitoring workspace with email or Google.": "Acesse seu ambiente de monitoramento com e-mail ou Google.", "Continue with Google": "Continuar com Google", "Opening Google…": "Abrindo Google…", "Only personal Google accounts ending in": "Somente contas pessoais do Google terminadas em", "are accepted.": "são aceitas.", "OR": "OU", "Email": "E-mail", "Password": "Senha", "Sign in with email": "Entrar com e-mail", "Create account with email": "Criar conta com e-mail", "Please wait…": "Aguarde…", "New to RichSentry?": "Novo no RichSentry?", "Create an account": "Criar uma conta", "Already have an account?": "Já possui uma conta?",
  "START MONITORING": "COMECE A MONITORAR", "Create your account": "Crie sua conta", "Use your email address or continue with a personal Google account.": "Use seu endereço de e-mail ou continue com uma conta pessoal do Google.",
  "Infrastructure overview": "Visão geral da infraestrutura", "Live data from your monitored services": "Dados ao vivo dos seus serviços monitorados", "Add your first endpoint to begin monitoring": "Adicione seu primeiro endpoint para começar", "UPTIME · 30 DAYS": "DISPONIBILIDADE · 30 DIAS", "No checks recorded yet": "Nenhuma verificação registrada", "Waiting for data": "Aguardando dados", "No active incidents": "Nenhum incidente ativo", "No active incidents.": "Nenhum incidente ativo.", "PERFORMANCE": "DESEMPENHO", "Recent response times": "Tempos de resposta recentes", "ACTIVE": "ATIVOS", "Recent incidents": "Incidentes recentes", "View all": "Ver todos", "LIVE STATUS": "STATUS AO VIVO", "Monitor status": "Status dos monitores", "STATUS": "STATUS", "RESPONSE": "RESPOSTA", "LAST CHECK": "ÚLTIMA VERIFICAÇÃO", "PENDING": "PENDENTE", "UP": "OPERACIONAL", "DOWN": "FORA DO AR", "DEGRADED": "DEGRADADO", "PAUSED": "PAUSADO",
  "Endpoints": "Endpoints", "All websites and APIs in this workspace.": "Todos os sites e APIs deste ambiente.", "TYPE": "TIPO", "ACTIONS": "AÇÕES", "Remove": "Remover", "Removing…": "Removendo…", "Waiting for first check": "Aguardando primeira verificação", "NO MONITORS YET": "AINDA NÃO HÁ MONITORES", "Add your first endpoint.": "Adicione seu primeiro endpoint.", "RichSentry will run an initial check as soon as it is created.": "O RichSentry fará uma verificação inicial assim que ele for criado.", "Create monitor": "Criar monitor",
  "Incident history": "Histórico de incidentes", "Confirmed outages and recoveries across your monitors.": "Falhas e recuperações confirmadas dos seus monitores.", "Currently requiring attention": "Requerendo atenção no momento", "TOTAL": "TOTAL", "All recorded incidents": "Todos os incidentes registrados", "ALL CLEAR": "TUDO NORMAL", "No incidents recorded.": "Nenhum incidente registrado.", "Confirmed monitor failures will automatically appear here.": "Falhas confirmadas aparecerão aqui automaticamente.", "INCIDENT": "INCIDENTE", "MONITOR": "MONITOR", "STARTED": "INICIADO", "RESOLVED": "RESOLVIDO", "Deleted monitor": "Monitor removido", "No cause recorded": "Causa não registrada",
  "STATUS PAGE": "PÁGINA DE STATUS", "A live operational summary based on your monitor results.": "Um resumo operacional baseado nos resultados dos seus monitores.", "CURRENT STATUS": "STATUS ATUAL", "ALL SYSTEMS OPERATIONAL": "TODOS OS SISTEMAS OPERACIONAIS", "SERVICE INTERRUPTION": "INTERRUPÇÃO DE SERVIÇO", "NO DATA": "SEM DADOS", "SERVICES": "SERVIÇOS", "Current availability": "Disponibilidade atual", "NO SERVICES": "NENHUM SERVIÇO", "Your status page is waiting for monitors.": "Sua página de status está aguardando monitores.", "Create a monitor to publish its current condition here.": "Crie um monitor para exibir sua condição atual aqui.",
  "INTERACTIVE PREVIEW": "DEMONSTRAÇÃO INTERATIVA", "This page uses example data. No account is required.": "Esta página utiliza dados de exemplo. Nenhuma conta é necessária.", "Create free account": "Criar conta grátis", "DEMO WORKSPACE": "AMBIENTE DE DEMONSTRAÇÃO", "Example monitoring data showing a typical RichSentry workspace.": "Dados de exemplo mostrando um ambiente típico do RichSentry.", "Based on 12,482 checks": "Baseado em 12.482 verificações", "Authentication latency": "Latência na autenticação", "Response time above threshold": "Tempo de resposta acima do limite",
  "Add a monitor": "Adicionar monitor", "+ New monitor": "+ Novo monitor", "RichSentry will validate this public endpoint on the server and begin checking it on the next worker run.": "O RichSentry validará este endpoint público no servidor e começará a verificá-lo na próxima execução.",
  "WORKSPACE": "AMBIENTE", "Workspace": "Ambiente", "Start with the service your users rely on most.": "Comece pelo serviço do qual seus usuários mais dependem.", "Add a public website or API endpoint to begin collecting status history.": "Adicione um site público ou endpoint de API para começar a registrar o histórico de status.", "Create your first monitor": "Criar seu primeiro monitor",
  "Name": "Nome", "Production API": "API de produção", "Type": "Tipo", "Website": "Site", "WEBSITE": "SITE", "HTTP method": "Método HTTP", "Interval": "Intervalo", "Every minute": "A cada minuto", "Every 5 minutes": "A cada 5 minutos", "Every 15 minutes": "A cada 15 minutos", "Every hour": "A cada hora", "Timeout (ms)": "Tempo limite (ms)", "Expected HTTP status": "Status HTTP esperado", "Slow after (ms)": "Considerar lento após (ms)", "Failures before incident": "Falhas antes de abrir incidente", "Successes before recovery": "Sucessos antes da recuperação", "Cancel": "Cancelar", "Creating…": "Criando…", "Failed to create monitor.": "Não foi possível criar o monitor.", "Only HTTP and HTTPS are supported": "Somente HTTP e HTTPS são compatíveis",
  "INVESTIGATING": "INVESTIGANDO", "IDENTIFIED": "IDENTIFICADO", "MONITORING": "MONITORANDO", "Remove this monitor": "Remover este monitor", "Could not remove this monitor.": "Não foi possível remover este monitor.",
  "Profile": "Perfil", "Organization": "Organização", "Team": "Equipe", "Notifications": "Notificações", "Webhooks": "Webhooks", "Security": "Segurança", "Billing": "Cobrança", "Configure": "Configurar", "Manage your workspace configuration and access.": "Gerencie as configurações e os acessos do seu ambiente.", "Free plan · Billing integration ready": "Plano grátis · Integração de cobrança preparada", "← Dashboard": "← Painel"
};

function translateText(value: string) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.trim();
  if (!core) return value;
  if (translations[core]) return `${leading}${translations[core]}${trailing}`;
  return value
    .replace(/(\d+) operational/g, "$1 operacionais")
    .replace(/(\d+) degraded/g, "$1 degradados")
    .replace(/(\d+) down/g, "$1 fora do ar")
    .replace(/(\d+) of (\d+) services operational/g, "$1 de $2 serviços operacionais")
    .replace(/(\d+) checks loaded/g, "$1 verificações carregadas")
    .replace(/Based on ([\d,.]+) checks/g, "Baseado em $1 verificações")
    .replace(/(\d+)s ago/g, "há $1s").replace(/(\d+)m ago/g, "há $1min").replace(/(\d+)h ago/g, "há $1h");
}

export function LanguageToggle() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("richsentry-language") === "pt-BR" ? "pt-BR" : "en";
    const timeout = window.setTimeout(() => setLanguage(saved), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const originals = new WeakMap<Node, string>();
    function apply() {
      document.documentElement.lang = language;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent || parent.closest("script,style,[data-no-translate]")) continue;
        if (!originals.has(node)) originals.set(node, node.textContent ?? "");
        const original = originals.get(node) ?? "";
        node.textContent = language === "pt-BR" ? translateText(original) : original;
      }
    }
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  function toggle() {
    const next = language === "en" ? "pt-BR" : "en";
    localStorage.setItem("richsentry-language", next);
    window.location.reload();
  }

  return <button data-no-translate type="button" className="languageToggle" onClick={toggle} aria-label={language === "en" ? "Mudar para português" : "Switch to English"} title={language === "en" ? "Mudar para português" : "Switch to English"}><Languages /><span>{language === "en" ? "PT-BR" : "EN"}</span></button>;
}
