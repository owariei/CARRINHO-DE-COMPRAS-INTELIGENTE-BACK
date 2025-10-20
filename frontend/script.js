const API_URL = 'http://localhost:3000/api';

async function carregarProdutos() {
    try {
        const response = await fetch(`${API_URL}/produtos`);
        const produtos = await response.json();
        
        const tbody = document.getElementById('produtosBody');
        tbody.innerHTML = '';
        
        produtos.forEach(produto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${produto.codigo_barras}</td>
                <td>${produto.nome}</td>
                <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
                <td>
                    <button class="btn-excluir" onclick="excluirProduto('${produto.codigo_barras}')">
                        Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        mostrarMensagem('Erro ao carregar produtos', 'erro');
    }
}

async function cadastrarProduto(event) {
    event.preventDefault();
    
    const codigoBarras = document.getElementById('codigoBarras').value;
    const nome = document.getElementById('nome').value;
    const preco = document.getElementById('preco').value;
    
    try {
        const response = await fetch(`${API_URL}/produtos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ codigo_barras: codigoBarras, nome, preco })
        });
        
        if (response.ok) {
            mostrarMensagem('Produto cadastrado com sucesso!', 'sucesso');
            document.getElementById('produtoForm').reset();
            carregarProdutos();
        } else {
            throw new Error('Erro ao cadastrar produto');
        }
    } catch (error) {
        mostrarMensagem('Erro ao cadastrar produto', 'erro');
    }
}

async function excluirProduto(codigoBarras) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        try {
            const response = await fetch(`${API_URL}/produtos/${codigoBarras}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                mostrarMensagem('Produto excluído com sucesso!', 'sucesso');
                carregarProdutos();
            } else {
                throw new Error('Erro ao excluir produto');
            }
        } catch (error) {
            mostrarMensagem('Erro ao excluir produto', 'erro');
        }
    }
}

function mostrarMensagem(mensagem, tipo) {
    const div = document.getElementById('mensagem');
    div.textContent = mensagem;
    div.className = tipo;
    setTimeout(() => {
        div.textContent = '';
        div.className = '';
    }, 3000);
}

// Event listeners
document.getElementById('produtoForm').addEventListener('submit', cadastrarProduto);

// Carregar produtos ao iniciar
carregarProdutos();