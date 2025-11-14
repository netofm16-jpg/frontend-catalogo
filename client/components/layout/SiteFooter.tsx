export function SiteFooter() {
  return (
    <footer className="border-t mt-8">
      <div className="container py-8 grid gap-4 md:grid-cols-3 text-sm">
        <div>
          <div className="font-bold text-lg">LP Tech</div>
          <p className="text-muted-foreground mt-2">
            Sua loja de tecnologia: celulares, acessórios e gadgets selecionados.
          </p>
        </div>
        <div>
          <div className="font-semibold">Atendimento</div>
          <ul className="mt-2 text-muted-foreground space-y-1">
            <li>Suporte: suporte@lptech.com</li>
            <li>WhatsApp: (11) 99999-9999</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Institucional</div>
          <ul className="mt-2 text-muted-foreground space-y-1">
            <li>Termos de uso</li>
            <li>Privacidade</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground pb-6">© {new Date().getFullYear()} LP Tech. Todos os direitos reservados.</div>
    </footer>
  );
}
