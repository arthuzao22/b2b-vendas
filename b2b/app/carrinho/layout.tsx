import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientSidebar } from "@/components/client-sidebar";

export default async function CarrinhoLayout({
    children,
}: {
    children: ReactNode;
}) {
    const session = await getServerSession(authOptions);

    // Se usuário está logado como cliente, mostra sidebar
    if (session?.user && session.user.tipo === "cliente") {
        return (
            <div className="min-h-screen bg-background">
                <ClientSidebar
                    userName={session.user.name || "Cliente"}
                    userRole="Cliente"
                />

                {/* Main content area with sidebar offset */}
                <main className="lg:pl-64">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        );
    }

    // Se não está logado ou não é cliente, mostra sem sidebar
    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
}
