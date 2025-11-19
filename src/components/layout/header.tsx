import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-6">
            <NavLinks />
          </nav>
        </div>
      </div>
    </header>
  );
}
