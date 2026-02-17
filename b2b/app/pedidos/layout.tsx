import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ClientSidebar } from "@/components/client-sidebar"

export default async function PedidosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Check authentication
  if (!session?.user) {
    redirect("/auth/login")
  }

  // Check if user is a client
  if (session.user.tipo !== "cliente") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientSidebar
        userName={session.user.name || "Cliente"}
        userRole="Cliente"
      />
      
      {/* Main content area with sidebar offset */}
      <main className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
