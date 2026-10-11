import { Navigation } from "./navigation";

export function MobileNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-hairline pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 px-3 shadow-xl">
      <Navigation isMobile={true} />
    </div>
  );
}
