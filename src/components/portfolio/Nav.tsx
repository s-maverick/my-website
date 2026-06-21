export function Nav() {
  const items = [
    { href: "#philosophy", label: "philosophy" },
    { href: "#experience", label: "experience" },
    { href: "#education", label: "education" },
    { href: "#work", label: "projects" },
    { href: "#stack", label: "stack" },
    { href: "#contact", label: "contact" },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 font-mono text-sm">
        <a href="#top" className="flex items-center gap-2 text-foreground">
          <span className="text-accent">$</span>
          <span className="font-display">sangam.patil</span>
          <span className="caret" aria-hidden />
        </a>
        <nav className="hidden items-center gap-6 text-xs uppercase tracking-wider text-muted-foreground md:flex">
          {items.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className="transition-colors hover:text-accent"
            >
              {i.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          hire_me()
        </a>
      </div>
    </header>
  );
}
