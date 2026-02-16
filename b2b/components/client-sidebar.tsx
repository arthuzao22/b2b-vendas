"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingBag as Logo,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { NotificationDropdown } from "@/components/ui/notification-dropdown"

interface ClientSidebarProps {
  userName: string
  userRole: string
}

const navItems = [
  { title: "Dashboard", href: "/dashboard/cliente", icon: LayoutDashboard },
  { title: "Catálogo", href: "/dashboard/cliente/catalogo", icon: ShoppingBag },
  { title: "Carrinho", href: "/carrinho", icon: ShoppingCart },
  { title: "Meus Pedidos", href: "/pedidos", icon: Package },
  { title: "Configurações", href: "/dashboard/cliente/configuracoes", icon: Settings },
]

export function ClientSidebar({ userName, userRole }: ClientSidebarProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" })
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-[var(--space-6)] border-b border-[hsl(var(--color-neutral-100))]">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[var(--space-2)] no-underline">
            <div className="flex items-center justify-center size-8 bg-[hsl(var(--color-brand-500))] rounded-[var(--radius-md)]">
              <Logo className="size-4.5 text-white" aria-hidden="true" />
            </div>
            <span className="text-[length:var(--text-md)] font-bold text-[hsl(var(--color-neutral-900))]">
              B2B Vendas
            </span>
          </Link>
          <NotificationDropdown />
        </div>
      </div>

      {/* User Info */}
      <div className="px-[var(--space-6)] py-[var(--space-5)] border-b border-[hsl(var(--color-neutral-100))]">
        <div className="flex items-center gap-[var(--space-3)]">
          <div className="flex items-center justify-center size-10 bg-[hsl(var(--color-brand-50))] rounded-full shrink-0">
            <span className="text-[length:var(--text-sm)] font-semibold text-[hsl(var(--color-brand-600))]">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-800))] truncate">
              {userName}
            </p>
            <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))] capitalize">
              {userRole}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-[var(--space-4)] py-[var(--space-3)]" aria-label="Menu do cliente">
        <div className="space-y-[var(--space-0-5)]">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "group relative flex items-center gap-[var(--space-3)]",
                  "h-10 px-[var(--space-4)] rounded-[var(--radius-md)]",
                  "text-[length:var(--text-sm)] font-medium no-underline",
                  "transition-all duration-[var(--transition-base)]",
                  isActive
                    ? "bg-[hsl(var(--color-brand-50))] text-[hsl(var(--color-brand-600))]"
                    : "text-[hsl(var(--color-neutral-600))] hover:bg-[hsl(var(--color-neutral-50))] hover:text-[hsl(var(--color-neutral-800))]"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[hsl(var(--color-brand-500))] rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    "size-5 shrink-0 transition-colors duration-[var(--transition-fast)]",
                    isActive
                      ? "text-[hsl(var(--color-brand-500))]"
                      : "text-[hsl(var(--color-neutral-400))] group-hover:text-[hsl(var(--color-neutral-600))]"
                  )}
                  aria-hidden="true"
                />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-[var(--space-4)] border-t border-[hsl(var(--color-neutral-100))]">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-[var(--space-3)] w-full",
            "h-10 px-[var(--space-4)] rounded-[var(--radius-md)]",
            "text-[length:var(--text-sm)] font-medium",
            "text-[hsl(var(--color-neutral-500))]",
            "transition-colors duration-[var(--transition-fast)]",
            "hover:bg-[hsl(var(--color-error-50))] hover:text-[hsl(var(--color-error-600))]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-brand-500))]"
          )}
        >
          <LogOut className="size-5" aria-hidden="true" />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-[var(--space-4)] left-[var(--space-4)] z-[var(--z-sticky)]">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64",
          "bg-[hsl(var(--color-neutral-0))]",
          "border-r border-[hsl(var(--color-neutral-100))]",
          "z-[var(--z-sticky)]",
          "transition-transform duration-[var(--transition-slow)]",
          "lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[var(--z-overlay)] bg-[hsl(var(--color-neutral-900)/0.5)] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
