import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default async function FornecedorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Check authentication
  if (!session?.user) {
    redirect("/auth/login")
  }

  // Check if user is a supplier
  if (session.user.tipo !== "fornecedor") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        userType="fornecedor"
        userName={session.user.name || "Fornecedor"}
        userRole="Fornecedor"
      />
      
      {/* Main content area with sidebar offset */}
      <main className="lg:pl-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
