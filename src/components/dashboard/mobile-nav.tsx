import { Navigation } from "./navigation";

export function MobileNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink/10 pb-safe pt-2 px-2 shadow-2xl">
      <Navigation isMobile={true} />
    </div>
  );
}
