import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (em ordem para respeitar as foreign keys)
  console.log('🗑️  Limpando dados existentes...');
  await prisma.itemPedido.deleteMany();
  await prisma.historicoStatusPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.precoCustomizado.deleteMany();
  await prisma.itemListaPreco.deleteMany();
  await prisma.listaPreco.deleteMany();
  await prisma.movimentacaoEstoque.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.clienteFornecedor.deleteMany();
  await prisma.notificacao.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.fornecedor.deleteMany();
  await prisma.usuario.deleteMany();

  // Criar usuários
  console.log('👤 Criando usuários...');
  const senhaHash = await bcrypt.hash('senha123', 10);

  const usuarioAdmin = await prisma.usuario.create({
    data: {
      email: 'admin@b2b.com',
      senha: senhaHash,
      nome: 'Administrador',
      tipo: 'admin',
      ativo: true,
    },
  });

  const usuarioFornecedor1 = await prisma.usuario.create({
    data: {
      email: 'fornecedor1@empresa.com',
      senha: senhaHash,
      nome: 'João Silva',
      tipo: 'fornecedor',
      telefone: '(11) 98765-4321',
      ativo: true,
    },
  });

  const usuarioFornecedor2 = await prisma.usuario.create({
    data: {
      email: 'fornecedor2@empresa.com',
      senha: senhaHash,
      nome: 'Maria Santos',
      tipo: 'fornecedor',
      telefone: '(21) 97654-3210',
      ativo: true,
    },
  });

  const usuarioCliente = await prisma.usuario.create({
    data: {
      email: 'cliente@empresa.com',
      senha: senhaHash,
      nome: 'Carlos Oliveira',
      tipo: 'cliente',
      telefone: '(31) 96543-2109',
      ativo: true,
    },
  });

  // Criar fornecedores
  console.log('🏢 Criando fornecedores...');
  const fornecedor1 = await prisma.fornecedor.create({
    data: {
      usuarioId: usuarioFornecedor1.id,
      razaoSocial: 'Tech Solutions LTDA',
      nomeFantasia: 'Tech Solutions',
      slug: 'tech-solutions',
      cnpj: '12.345.678/0001-90',
      descricao: 'Fornecedor de equipamentos e suprimentos de tecnologia',
      logo: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=200',
      banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
      endereco: 'Rua das Tecnologias, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      verificado: true,
    },
  });

  const fornecedor2 = await prisma.fornecedor.create({
    data: {
      usuarioId: usuarioFornecedor2.id,
      razaoSocial: 'Office Supplies Corporation',
      nomeFantasia: 'Office Pro',
      slug: 'office-pro',
      cnpj: '98.765.432/0001-10',
      descricao: 'Especialista em material de escritório e papelaria',
      logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200',
      banner: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200',
      endereco: 'Av. Comercial, 456',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      cep: '20000-000',
      verificado: true,
    },
  });

  // Criar cliente
  console.log('👥 Criando cliente...');
  const cliente = await prisma.cliente.create({
    data: {
      usuarioId: usuarioCliente.id,
      razaoSocial: 'Empresa Compradora LTDA',
      nomeFantasia: 'Empresa Compradora',
      cnpj: '11.222.333/0001-44',
      inscricaoEstadual: '123.456.789',
      endereco: 'Rua dos Compradores, 789',
      cidade: 'Belo Horizonte',
      estado: 'MG',
      cep: '30000-000',
    },
  });

  // Criar categorias
  console.log('📂 Criando categorias...');
  const catEletronicos = await prisma.categoria.create({
    data: {
      nome: 'Eletrônicos',
      slug: 'eletronicos',
      descricao: 'Produtos eletrônicos e tecnologia',
      imagem: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    },
  });

  const catComputadores = await prisma.categoria.create({
    data: {
      nome: 'Computadores',
      slug: 'computadores',
      descricao: 'Notebooks, desktops e acessórios',
      imagem: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
      categoriaPaiId: catEletronicos.id,
    },
  });

  const catPerifericos = await prisma.categoria.create({
    data: {
      nome: 'Periféricos',
      slug: 'perifericos',
      descricao: 'Mouse, teclado, monitor e outros',
      imagem: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
      categoriaPaiId: catEletronicos.id,
    },
  });

  const catEscritorio = await prisma.categoria.create({
    data: {
      nome: 'Escritório',
      slug: 'escritorio',
      descricao: 'Material de escritório e papelaria',
      imagem: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400',
    },
  });

  const catMobiliario = await prisma.categoria.create({
    data: {
      nome: 'Mobiliário',
      slug: 'mobiliario',
      descricao: 'Mesas, cadeiras e móveis de escritório',
      imagem: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
      categoriaPaiId: catEscritorio.id,
    },
  });

  // Criar produtos da Tech Solutions
  console.log('📦 Criando produtos...');
  
  const produtos = [
    // Produtos de Tecnologia
    {
      fornecedorId: fornecedor1.id,
      categoriaId: catComputadores.id,
      nome: 'Notebook Dell Inspiron 15',
      slug: 'notebook-dell-inspiron-15',
      sku: 'DELL-NB-INS15-001',
      descricao: 'Notebook Dell Inspiron 15 com processador Intel Core i7, 16GB RAM, SSD 512GB, tela Full HD 15.6"',
      precoBase: 4299.90,
      imagens: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      ],
      ativo: true,
      quantidadeEstoque: 25,
      estoqueMinimo: 5,
      estoqueMaximo: 100,
      peso: 2.1,
      unidadeMedida: 'un',
    },
    {
      fornecedorId: fornecedor1.id,
      categoriaId: catComputadores.id,
      nome: 'MacBook Air M2',
      slug: 'macbook-air-m2',
      sku: 'APPLE-MBA-M2-001',
      descricao: 'MacBook Air com chip M2, 8GB de memória unificada, SSD de 256GB, tela Retina 13.6"',
      precoBase: 9999.00,
      imagens: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
      ],
      ativo: true,
      quantidadeEstoque: 15,
      estoqueMinimo: 3,
      estoqueMaximo: 50,
      peso: 1.24,
      unidadeMedida: 'un',
    },
    {
      fornecedorId: fornecedor1.id,
      categoriaId: catPerifericos.id,
      nome: 'Mouse Logitech MX Master 3S',
      slug: 'mouse-logitech-mx-master-3s',
      sku: 'LOGI-MOUSE-MX3S-001',
      descricao: 'Mouse sem fio Logitech MX Master 3S, sensor de 8000 DPI, tecnologia Quiet Click, bateria de até 70 dias',
      precoBase: 599.90,
      imagens: [
        'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800',
      ],
      ativo: true,
      quantidadeEstoque: 50,
      estoqueMinimo: 10,
      estoqueMaximo: 200,
      peso: 0.14,
      unidadeMedida: 'un',
    },
    {
      fornecedorId: fornecedor1.id,
      categoriaId: catPerifericos.id,
      nome: 'Teclado Mecânico Keychron K8',
      slug: 'teclado-mecanico-keychron-k8',
      sku: 'KEY-TKL-K8-001',
      descricao: 'Teclado mecânico sem fio Keychron K8, switches Gateron Red, layout TKL, RGB retroiluminado',
      precoBase: 689.90,
      imagens: [
        'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
      ],
      ativo: true,
      quantidadeEstoque: 35,
      estoqueMinimo: 8,
      estoqueMaximo: 150,
      peso: 0.8,
      unidadeMedida: 'un',
    },
    {
      fornecedorId: fornecedor1.id,
      categoriaId: catPerifericos.id,
      nome: 'Monitor LG UltraWide 34"',
      slug: 'monitor-lg-ultrawide-34',
      sku: 'LG-MON-UW34-001',
      descricao: 'Monitor LG UltraWide 34" IPS, resolução 2560x1080, 75Hz, FreeSync, HDR10',
      precoBase: 2299.90,
      imagens: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
        'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800',
      ],
      ativo: true,
      quantidadeEstoque: 18,
      estoqueMinimo: 4,
      estoqueMaximo: 80,
      peso: 7.5,
      unidadeMedida: 'un',
    },
    {
      fornecedorId: fornecedor1.id,
      categoriaId: catPerifericos.id,
      nome: 'Webcam Logitech C920 HD Pro',
      slug: 'webcam-logitech-c920',
      sku: 'LOGI-CAM-C920-001',
      descricao: 'Webcam Logitech C920 Full HD 1080p, microfones estéreo, correção automática de luz',
      precoBase: 449.90,
      imagens: [
        'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800',
      ],
      ativo: true,
      quantidadeEstoque: 42,
      estoqueMinimo: 10,
      estoqueMaximo: 150,
      peso: 0.16,
      unidadeMedida: 'un',
    },
    {
      fornecedorId: fornecedor1.id,
      categoriaId: catPerifericos.id,
      nome: 'Headset HyperX Cloud II',
      slug: 'headset-hyperx-cloud-ii',
      sku: 'HX-HEAD-C2-001',
      descricao: 'Headset gamer HyperX Cloud II, som surround 7.1, drivers 53mm, microfone removível',
      precoBase: 599.90,
      imagens: [
        'https://images.unsplash.com/photo-1599669454699-248893623440?w=800',
        'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800',
      ],
      ativo: true,
      quantidadeEstoque: 30,
      estoqueMinimo: 8,
      estoqueMaximo: 120,
      peso: 0.32,
      unidadeMedida: 'un',
    },

    // Produtos de Escritório
    {
      fornecedorId: fornecedor2.id,
      categoriaId: catMobiliario.id,
      nome: 'Cadeira Ergonômica Presidente',
      slug: 'cadeira-ergonomica-presidente',
      sku: 'OFF-CHAIR-ERG-001',
      descricao: 'Cadeira presidente ergonômica com apoio lombar, braços ajustáveis, couro sintético, suporta até 120kg',
      precoBase: 1299.90,
      imagens: [
        'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
        'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800',
      ],
      ativo: true,
      quantidadeEstoque: 20,
      estoqueMinimo: 5,
      estoqueMaximo: 80,
      peso: 18.5,
      unidadeMedida: 'un',
    },
    {
      fornecedorId: fornecedor2.id,
      categoriaId: catMobiliario.id,
      nome: 'Mesa de Escritório em L',
      slug: 'mesa-escritorio-em-l',
      sku: 'OFF-DESK-L-001',
      descricao: 'Mesa de escritório formato em L, tampo em MDF, acabamento em madeirado, dimensões 150x150cm',
      precoBase: 899.90,
      imagens: [
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800',
        'https://images.unsplash.com/photo-1595428774479-5d19b3c4e36e?w=800',
      ],
      ativo: true,
      quantidadeEstoque: 12,
      estoqueMinimo: 3,
      estoqueMaximo: 50,
      peso: 35.0,
      unidadeMedida: 'un',
    },
    {
      fornecedorId: fornecedor2.id,
      categoriaId: catEscritorio.id,
      nome: 'Kit Canetas Esferográficas 50un',
      slug: 'kit-canetas-esferograficas-50',
      sku: 'OFF-PEN-KIT50-001',
      descricao: 'Kit com 50 canetas esferográficas ponta média, tinta azul e preta, corpo transparente',
      precoBase: 79.90,
      imagens: [
        'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800',
      ],
      ativo: true,
      quantidadeEstoque: 100,
      estoqueMinimo: 20,
      estoqueMaximo: 500,
      peso: 0.5,
      unidadeMedida: 'cx',
    },
    {
      fornecedorId: fornecedor2.id,
      categoriaId: catEscritorio.id,
      nome: 'Papel Sulfite A4 Resma 500 folhas',
      slug: 'papel-sulfite-a4-500',
      sku: 'OFF-PAPER-A4-500',
      descricao: 'Papel sulfite A4 branco 75g/m², 500 folhas, alta qualidade para impressão',
      precoBase: 29.90,
      imagens: [
        'https://images.unsplash.com/photo-1586953208270-767889fa9b55?w=800',
      ],
      ativo: true,
      quantidadeEstoque: 200,
      estoqueMinimo: 50,
      estoqueMaximo: 1000,
      peso: 2.5,
      unidadeMedida: 'resma',
    },
    {
      fornecedorId: fornecedor2.id,
      categoriaId: catEscritorio.id,
      nome: 'Organizador de Mesa Acrílico',
      slug: 'organizador-mesa-acrilico',
      sku: 'OFF-ORG-ACR-001',
      descricao: 'Organizador de mesa em acrílico transparente, 5 compartimentos, design moderno',
      precoBase: 89.90,
      imagens: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
      ],
      ativo: true,
      quantidadeEstoque: 45,
      estoqueMinimo: 10,
      estoqueMaximo: 200,
      peso: 0.8,
      unidadeMedida: 'un',
    },
  ];

  for (const produtoData of produtos) {
    await prisma.produto.create({
      data: produtoData,
    });
  }

  // Criar lista de preços
  console.log('💰 Criando listas de preços...');
  const listaPreco1 = await prisma.listaPreco.create({
    data: {
      fornecedorId: fornecedor1.id,
      nome: 'Clientes Premium',
      descricao: 'Desconto especial para clientes premium',
      tipoDesconto: 'percentual',
      valorDesconto: 15,
      ativo: true,
    },
  });

  // Vincular cliente ao fornecedor
  console.log('🔗 Vinculando cliente ao fornecedor...');
  await prisma.clienteFornecedor.create({
    data: {
      clienteId: cliente.id,
      fornecedorId: fornecedor1.id,
      listaPrecoId: listaPreco1.id,
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log(`
📊 Resumo:
  - ${await prisma.usuario.count()} usuários criados
  - ${await prisma.fornecedor.count()} fornecedores criados
  - ${await prisma.cliente.count()} clientes criados
  - ${await prisma.categoria.count()} categorias criadas
  - ${await prisma.produto.count()} produtos criados
  - ${await prisma.listaPreco.count()} listas de preço criadas

🔐 Credenciais de acesso:
  Admin:
    Email: admin@b2b.com
    Senha: senha123
  
  Fornecedor 1 (Tech Solutions):
    Email: fornecedor1@empresa.com
    Senha: senha123
  
  Fornecedor 2 (Office Pro):
    Email: fornecedor2@empresa.com
    Senha: senha123
  
  Cliente:
    Email: cliente@empresa.com
    Senha: senha123
  `);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
