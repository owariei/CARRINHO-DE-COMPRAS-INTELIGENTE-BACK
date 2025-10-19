const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'produtos.txt');

// Middlewares
app.use(cors());
app.use(express.json());

// SERVE OS ARQUIVOS ESTÁTICOS DO FRONTEND (HTML, CSS, JS)
// Isso diz para o Express servir tudo que está na pasta 'frontend'
app.use(express.static(path.join(__dirname, '../frontend')));

// Função para ler todos os produtos do arquivo TXT
async function readProducts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');

    const produtos = lines.map(line => {
      const [codigo_barras, nome, preco] = line.split(';');
      return {
        codigo_barras: codigo_barras || '',
        nome: nome || '',
        preco: parseFloat(preco) || 0.0
      };
    });
    return produtos;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Arquivo não encontrado. Criando novo...');
      const produtosIniciais = [
        { codigo_barras: '7891234567890', nome: 'Produto Exemplo 1', preco: 10.50 },
        { codigo_barras: '7899876543210', nome: 'Produto Exemplo 2', preco: 25.90 },
        { codigo_barras: '7891111111111', nome: 'Produto Exemplo 3', preco: 5.75 }
      ];
      await saveProducts(produtosIniciais);
      return produtosIniciais;
    } else {
      console.error('Erro ao ler o arquivo:', error);
      return [];
    }
  }
}

async function saveProducts(products) {
  const lines = products.map(p => `${p.codigo_barras};${p.nome};${p.preco}`);
  await fs.writeFile(DATA_FILE, lines.join('\n'));
}

// ROTA GET /api/produtos - Retorna todos os produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const produtos = await readProducts();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// ROTA POST /api/produtos - Adiciona um novo produto
app.post('/api/produtos', async (req, res) => {
  try {
    const { codigo_barras, nome, preco } = req.body;
    
    if (!codigo_barras || !nome || preco === undefined) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const precoNumero = parseFloat(preco);
    if (isNaN(precoNumero)) {
      return res.status(400).json({ error: 'O preço deve ser um número' });
    }

    const produtos = await readProducts();
    produtos.push({ codigo_barras, nome, preco: precoNumero });
    await saveProducts(produtos);

    res.json({ message: 'Produto cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar produto' });
  }
});

// ROTA DELETE /api/produtos/:codigo - Remove um produto
app.delete('/api/produtos/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    let produtos = await readProducts();
    produtos = produtos.filter(p => p.codigo_barras !== codigo);
    await saveProducts(produtos);
    res.json({ message: 'Produto removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover produto' });
  }
});

// ✅ ROTA PARA SERVIR O ARQUIVO PRINCIPAL (opcional, mas ajuda)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🟢 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📊 API está disponível em: http://localhost:${PORT}/api/produtos`);
  console.log(`🌐 Frontend está disponível em: http://localhost:${PORT}`);
});