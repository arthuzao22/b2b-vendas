import Header from "@/components/header"
import Footer from "@/components/footer"

export default function FornecedorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
