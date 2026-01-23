interface Props {
  params: {
    slug: string;
  };
}

export default function FornecedorPage({ params }: Props) {
  return (
    <div>
      <h1>Fornecedor: {params.slug}</h1>
    </div>
  );
}
