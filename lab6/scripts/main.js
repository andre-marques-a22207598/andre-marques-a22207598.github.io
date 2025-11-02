import { produtos } from './produtos.js';

// ==========================
//      Seletores principais
// ==========================
const produtos_section = document.querySelector('#produtos');
const cesto_section = document.querySelector('#cesto');
const quantProdutos_p = document.querySelector('#quantProdutos');
const h2_cesto = document.querySelector('#h2_cesto');
const custoTotal_p = document.querySelector('#custoTotal');
const quantCesto_p = document.querySelector('#quantCesto');

let quantidadeProduto = 0;

// ==========================
//      Funções principais
// ==========================

function mostrarProdutos() {
    produtos.forEach(produto => {
        produtos_section.append(
            criarElementosHTML(
                'produtos',
                produto.title,
                produto.image,
                produto.category,
                produto.price,
                produto.description,
                produto.rating.rate,
                produto.rating.count
            )
        );

        quantProdutos_p.textContent = ++quantidadeProduto;
    });
}

function criarElementosHTML(noPai, title, image, category, price, description, rate, ratingCount) {
    const article = document.createElement('article');
    const img = document.createElement('img');
    const h3 = document.createElement('h3');
    const spanPreco = document.createElement('span');
    const spanAvaliacao = document.createElement('span');
    const spanIconeCarrinho = document.createElement('span');
    const spanDescricao = document.createElement('span');
    const spanQtdAvaliacoes = document.createElement('span');
    const pDescricao = document.createElement('p');
    const pPreco = document.createElement('p');
    const pCarrinho = document.createElement('p');
    const buttonDescricao = document.createElement('button');
    const buttonCarrinho = document.createElement('button');
    const figure = document.createElement('figure');

    // --- imagem ---
    img.src = image;
    img.alt = category;
    figure.append(img);

    

    // --- título ---
    h3.textContent = title;

    // --- preço e botão "Ver mais" ---
    spanPreco.textContent = `${price} €`;
    spanPreco.classList.add('preco');
    buttonDescricao.textContent = 'Ver mais';
    pPreco.append(spanPreco, buttonDescricao);

    // --- descrição ---
    spanDescricao.textContent = description;
    spanQtdAvaliacoes.textContent = ratingCount;
    spanQtdAvaliacoes.classList.add('contAvaliacao');
    const spanTextoAvaliacao = document.createElement('span');
    spanTextoAvaliacao.append('Avaliado por ', spanQtdAvaliacoes, ' pessoas');
    pDescricao.append(spanDescricao, spanTextoAvaliacao);
    pDescricao.classList.add('descricao');

    buttonDescricao.addEventListener('click', () => {
        mostrarDescricao(window.getComputedStyle(pDescricao).display, buttonDescricao, pDescricao);
    });

    // --- botão adicionar/remover carrinho ---
    spanIconeCarrinho.textContent = 'Adicionar Ao Cesto';

    if (noPai === 'produtos') {
        pCarrinho.textContent = '+';
        buttonCarrinho.addEventListener('click', () => {
            adicionarNoCesto(article);
        });
    }

    buttonCarrinho.classList.add('adicionarCesto');
    buttonCarrinho.append(spanIconeCarrinho, pCarrinho);

    // --- montagem do artigo ---
    article.classList.add('produto');
    article.append(figure, spanAvaliacao, h3, pPreco, pDescricao, buttonCarrinho);

    return article;
}

function mostrarDescricao(display, button, p) {
    if (display === 'block') {
        p.style.display = 'none';
        button.textContent = 'Ver mais';
    } else {
        p.style.display = 'block';
        button.textContent = 'Ver menos';
    }
}

// ==========================
//      Carrinho / Cesto
// ==========================

if (!localStorage.getItem('produtosNoCarrinho')) {
    localStorage.setItem('produtosNoCarrinho', '[]');
}

function verificarEstadoCesto(produtosNoCarrinho) {
    let custoTotal = 0;
    cesto_section.innerHTML = '';

    produtosNoCarrinho.forEach((produto, index) => {
        const article = criarElementosHTML(
            null,
            produto.title,
            produto.image,
            produto.category,
            produto.price,
            produto.description,
            produto.rate,
            produto.ratingCount
        );

        const p = article.querySelector('.adicionarCesto p');
        const button = article.querySelector('.adicionarCesto');

        p.textContent = '-';
        button.onclick = () => removerNoCesto(index);

        custoTotal += parseFloat(produto.price);

        cesto_section.append(article);
    });

    // Atualiza o custo total
    if (custoTotal === 0) {
        custoTotal_p.style.display = 'none';
    } else {
        custoTotal_p.textContent = `${custoTotal.toFixed(2)} €`;
        custoTotal_p.style.display = 'inline';
    }

    // Mostrar ou esconder o cesto
    if (cesto_section.children.length > 0) {
        h2_cesto.style.display = 'flex';
        cesto_section.style.display = 'flex';
    } else {
        h2_cesto.style.display = 'none';
        cesto_section.style.display = 'none';
    }

    quantCesto_p.textContent = produtosNoCarrinho.length;
}

function adicionarNoCesto(article) {
    const produto = {
        title: article.querySelector('h3').textContent,
        image: article.querySelector('img').src,
        category: article.querySelector('img').alt,
        price: article.querySelector('.preco').textContent.slice(0, -2).trim(),
        description: article.querySelector('.descricao').textContent,
        rate: article.querySelector('.avaliacao').textContent.replace(/[^\d.]/g, ''),
        ratingCount: article.querySelector('.contAvaliacao').textContent
    };

    let produtosNoCarrinho = JSON.parse(localStorage.getItem('produtosNoCarrinho')) || [];
    produtosNoCarrinho.push(produto);

    localStorage.setItem('produtosNoCarrinho', JSON.stringify(produtosNoCarrinho));

    verificarEstadoCesto(produtosNoCarrinho);

    // --- mensagem visual ---
    mostrarMensagem('✅ Produto adicionado ao cesto!', 'sucesso');
}

function removerNoCesto(index) {
    let produtosNoCarrinho = JSON.parse(localStorage.getItem('produtosNoCarrinho')) || [];
    produtosNoCarrinho.splice(index, 1);
    localStorage.setItem('produtosNoCarrinho', JSON.stringify(produtosNoCarrinho));
    verificarEstadoCesto(produtosNoCarrinho);

    mostrarMensagem('🗑️ Produto removido do cesto', 'erro');
}

// ==========================
//     Mensagem animada
// ==========================
function mostrarMensagem(texto, tipo = 'sucesso') {
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem-popup ${tipo}`;
    mensagem.textContent = texto;
    document.body.appendChild(mensagem);

    // Força reflow para ativar animação
    void mensagem.offsetWidth;

    mensagem.classList.add('mostrar');

    setTimeout(() => {
        mensagem.classList.remove('mostrar');
        setTimeout(() => mensagem.remove(), 300);
    }, 2000);
}

// --- estilos básicos da notificação ---
const estilo = document.createElement('style');
estilo.textContent = `
.mensagem-popup {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-20px);
    padding: 12px 20px;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    opacity: 0;
    z-index: 9999;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.mensagem-popup.sucesso { background: #4caf50; }
.mensagem-popup.erro { background: #f44336; }
.mensagem-popup.mostrar {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}
`;
document.head.appendChild(estilo);

// ==========================
//   Inicialização da página
// ==========================

document.addEventListener('DOMContentLoaded', () => {
    mostrarProdutos();
    const produtosNoCarrinho = JSON.parse(localStorage.getItem('produtosNoCarrinho')) || [];
    verificarEstadoCesto(produtosNoCarrinho);
});
