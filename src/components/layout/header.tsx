import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* 모바일에서는 하단 네비게이션 사용, 데스크탑에서만 상단 네비게이션 표시 */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLinks />
          </nav>
        </div>
      </div>
    </header>
  );
}
