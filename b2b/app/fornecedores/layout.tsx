import Header from "@/components/header"
import Footer from "@/components/footer"

export default function FornecedoresLayout({
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
