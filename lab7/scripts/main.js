const produtosAPI = await buscarProdutosAPI();
const produtos = document.querySelector('#produtos');
const quantProdutos = document.querySelector('#quantProdutos');
let quantidadeProduto = 0;
async function buscarProdutosAPI() {
    const carregamento = document.querySelector('#carregamento');

    try {
        carregamento.classList.remove('oculto');

        const resposta = await fetch('https://deisishop.pythonanywhere.com/products');
        const produtos = await resposta.json();

        return produtos;

    } catch (erro) {
        return [];

    } finally {
        carregamento.classList.add('oculto');
    }
}
function criarElementosHMTML(noPai, title, image, category, price, description, rate, ratingCount) {
    let article = document.createElement('article');
    let figure = document.createElement('figure');
    let img = document.createElement('img');
    let h3_nome = document.createElement('h3');
    let span_preco = document.createElement('span');
    let span_iconeSacola = document.createElement('span');
    let span_avaliacao = document.createElement('span');
    let span_descricao = document.createElement('span');
    let span_textoQuantAvalicao = document.createElement('span');
    let span_quantAvaliacao = document.createElement('span');
    let p_descricao = document.createElement('p');
    let p_2 = document.createElement('p');
    let p_adicionarCesto = document.createElement('p');
    let button_adicionarCesto = document.createElement('button');
    let button_verMais = document.createElement('button');


    img.setAttribute('src', image);
    img.setAttribute('alt', category);
    figure.append(img);

    span_avaliacao.innerHTML = rate;
    span_avaliacao.classList.add('avaliacao');
span_iconeSacola.textContent = 'Adicionar';
    h3_nome.textContent = title;
    
    span_preco.textContent = price + ' €';
    span_preco.classList.add('preco');
    button_verMais.textContent = 'Ver mais';
    p_2.append(span_preco, button_verMais);

    span_descricao.textContent = description;
    span_quantAvaliacao.textContent = ratingCount;
    span_quantAvaliacao.classList.add('contAvaliacao')
    span_textoQuantAvalicao.append('Avaliado por ', span_quantAvaliacao, ' pessoas');
    p_descricao.append(span_descricao, span_textoQuantAvalicao);
    p_descricao.classList.add('descricao');
    button_verMais.addEventListener('click', () => {
        mostrarDescricao(window.getComputedStyle(p_descricao).display, button_verMais, p_descricao);
    });

    if (noPai == 'produtos') {
        p_adicionarCesto.textContent = '+';
        button_adicionarCesto.addEventListener('click', () => {
            adionarNoCesto(article);
        });
    }
    button_adicionarCesto.classList.add('adicionarCesto');
    button_adicionarCesto.append(span_iconeSacola, p_adicionarCesto);

    article.classList.add('produto');
    article.append(figure, span_avaliacao, h3_nome, p_2, p_descricao, button_adicionarCesto);

    return article;
}
function renderizarProdutos(listaProdutos) {
    produtos.innerHTML = '';

    listaProdutos.forEach((produto) => {
        let article = document.createElement('article');

        article = criarElementosHMTML(
            'produtos',
            produto.title, 
            produto.image, 
            produto.category, 
            produto.price, 
            produto.description, 
            produto.rating.rate, 
            produto.rating.count
        );

        produtos.append(article);
    });

    quantProdutos.textContent = produtos.children.length;
}

renderizarProdutos(produtosAPI);

const cestoHTML = document.querySelector('#cesto');
const h2_cesto = document.querySelector('#h2_cesto');
const custoTotalCesto = document.querySelector('#custoTotal');
const quantCesto = document.querySelector('#quantCesto');
const buttonMostrarCampoPagamento = document.querySelector('#mostrarCampoPagamento');


function renderizarCesto(produtosNoCesto) {
    let somatorio = 0;
    cestoHTML.innerHTML = '';

    produtosNoCesto.forEach((produto, index) => {
        const article = criarElementosHMTML(
            null, 
            produto.title, 
            produto.image, 
            produto.category, 
            produto.price, 
            produto.description, 
            produto.rate, 
            produto.ratingCount
        );

        const p_removerCesto = article.querySelector('.adicionarCesto p');
        const button_removerCesto = article.querySelector('.adicionarCesto');

        p_removerCesto.textContent = '-';
        button_removerCesto.onclick = () => removerNoCesto(index);
       
        somatorio += parseFloat(produto.price);
        cestoHTML.append(article);
    });

    if (custoTotalCesto != 0) {
        custoTotalCesto.style.display = 'inline';
        custoTotalCesto.textContent = somatorio.toFixed(2) + ' €';
    } else {
        custoTotalCesto.style.display = 'none';
    }

    h2_cesto.style.display = (cestoHTML.children.length != 0) ? 'flex' : 'none';
    cestoHTML.style.display = (cestoHTML.children.length != 0) ? 'flex' : 'none';

    if (cestoHTML.children.length != 0) {
        buttonMostrarCampoPagamento.classList.remove('oculto');
    } else {
        buttonMostrarCampoPagamento.classList.add('oculto');
    }

    quantCesto.textContent = produtosNoCesto.length;
}

function adionarNoCesto(article) {
    const produto = {
        title: article.querySelector('h3').textContent,
        image: article.querySelector('img').src,
        category: article.querySelector('img').alt,
        price: article.querySelector('.preco').textContent.slice(0, -2),
        description: article.querySelector('.descricao').textContent,
        rate: article.querySelector('.avaliacao').textContent.slice(-3),
        ratingCount: article.querySelector('.contAvaliacao').textContent
    }

    let produtosNoCesto = JSON.parse(localStorage.getItem('produtosNoCesto')) || [];

    produtosNoCesto = [...produtosNoCesto, produto];

    localStorage.setItem('produtosNoCesto', JSON.stringify(produtosNoCesto));

    renderizarCesto(produtosNoCesto);
    mostrarMensagem('✅ Produto adicionado ao cesto!', 'sucesso');
}

function removerNoCesto(index) {
    let produtosNoCesto = JSON.parse(localStorage.getItem('produtosNoCesto'));

    produtosNoCesto.splice(index, 1);

    localStorage.setItem('produtosNoCesto', JSON.stringify(produtosNoCesto));

    renderizarCesto(produtosNoCesto);
    mostrarMensagem('🗑️ Produto removido do cesto', 'erro');
}


function mostrarMensagem(texto, tipo = 'sucesso') {
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem-popup ${tipo}`;
    mensagem.textContent = texto;
    document.body.appendChild(mensagem);
    void mensagem.offsetWidth;
    mensagem.classList.add('mostrar');
    setTimeout(() => {
        mensagem.classList.remove('mostrar');
        setTimeout(() => mensagem.remove(), 300);
    }, 2000);
}

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



const filtroArtigo = document.querySelector('#filtroArtigo');
const filtroOrdenacao = document.querySelector('#filtroOrdenacao');
const filtroBusca = document.querySelector('#filtroBusca');
let produtosFiltrados = [...produtosAPI];
const artigosAPI = await buscarArtigosAPI();


async function adicionarOpcoesFiltroArtigo() {
    filtroArtigo.innerHTML = '';
    filtroArtigo.innerHTML = '<option value="todos">Todos os artigos</option>';
    filtroArtigo.innerHTML += artigosAPI.map(artigo => `<option value="${artigo}">${artigo}</option>`);
}

async function buscarArtigosAPI() {
    try {
        const resposta = await fetch('https://deisishop.pythonanywhere.com/categories');
        const categorias = await resposta.json();

        return categorias;

    } catch (erro) {
        return [];
    }
}

function filtrarPorNome() {
    const mensagemSemProduto = document.querySelector('#mensagemSemProduto');
    let busca = produtosFiltrados.filter(produto => produto.title.toLowerCase().includes(filtroBusca.value.toLowerCase().trim()));

    if (busca.length == 0) {
        mensagemSemProduto.classList.remove('oculto');
    } else {
        mensagemSemProduto.classList.add('oculto');
    }

    renderizarProdutos(busca);
}

function filtrarPorPreco() {
    switch (filtroOrdenacao.value) {
        case 'crescente':
            produtosFiltrados.sort((a, b) => a.price - b.price);
            break;
        case 'decrescente':
            produtosFiltrados.sort((a, b) => b.price - a.price);
            break;
    }

    filtrarPorNome();
}

function filtrarPorArtigo() {
    produtosFiltrados = [];

    if (filtroArtigo.value != 'todos') {
        for (let i = 0; i < produtosAPI.length; i++) {
            if (produtosAPI[i]['category'] == filtroArtigo.value) {
                produtosFiltrados = [...produtosFiltrados, produtosAPI[i]];
            }
        }
    } else {
        produtosFiltrados = [...produtosAPI];
    }

    filtrarPorPreco();
    filtrarPorNome();
}

adicionarOpcoesFiltroArtigo();

filtroArtigo.addEventListener('change', () => { filtrarPorArtigo(); });

filtroOrdenacao.addEventListener('change', () => { filtrarPorPreco() });

filtroBusca.addEventListener('keyup', () => { filtrarPorNome() });

const campoPagamento = document.querySelector('#campoPagamento');
const formPagamento = document.querySelector('#formPagamento');
const buttonPagamento = document.querySelector('#formPagamento > button');
const buttonFecharCampoPagamento = document.querySelector('#fecharCampoPagamento');
const estudante = document.querySelector('#estudante');
const codigoCupom = document.querySelector('#cupom');
const nomePagamento = document.querySelector('#nome');
const mensagensCompraRealizada = document.querySelector('#mensagensCompraRealizada');
const mensagemNome = document.querySelector('#mensagemNome');
const mensagemEndereço = document.querySelector('#mensagemEndereço');
const mensagemPrecoFinal = document.querySelector('#mensagemPrecoFinal');
const mensagemReferencia = document.querySelector('#mensagemReferencia');
let eEstudante = false;



function retornaIDsProdutosCesto() {
    let ids = [];

    JSON.parse(localStorage.getItem('produtosNoCesto')).forEach((produtoNoCesto) => {
        produtosAPI.forEach((produto) => {
            if (produto.title == produtoNoCesto.title) {
                ids = [... ids, produto.id];
            }
        });
    });
    return ids;
}

function toggleCampoPagemento(toggleStatus) {
    if (toggleStatus) {
        campoPagamento.classList.remove('oculto');
    } else {
        campoPagamento.classList.add('oculto');
    }   
}

function textoPrecoFinal(valorFinal) {
    let texto = 'Valor final a pagar: ';
    let custoTotal = custoTotalCesto.textContent.slice(0, -2);
    
    if (custoTotal > valorFinal) {
        texto += `<span id="comDesconto">${custoTotal} €</span> `;
    } 

    texto += `<span id="valorFinal">${valorFinal} €</span>`;

    console.log(texto)

    return texto;
}



buttonMostrarCampoPagamento.addEventListener('click', () => toggleCampoPagemento(true));

buttonFecharCampoPagamento.addEventListener('click', () => toggleCampoPagemento(false));

estudante.addEventListener('click', () => { 
    eEstudante = !eEstudante;
});

formPagamento.addEventListener('submit', async (event) => {
    const url_post = 'https://deisishop.pythonanywhere.com/buy/';
    event.preventDefault();
    
    try {
        const resposta = await fetch(url_post, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify ({
                "products": retornaIDsProdutosCesto(),
                "student": eEstudante,
                "coupon": codigoCupom.value,
                "name": nomePagamento.value
            })
        });

        const dados = await resposta.json();

        mensagensCompraRealizada.classList.remove('oculto');
        mensagemNome.textContent = dados.message;
        mensagemEndereço.textContent = dados.address;
        mensagemPrecoFinal.innerHTML = textoPrecoFinal(dados.totalCost);
        mensagemReferencia.innerHTML = `Referência de pagamento: <span id="referencia">${dados.reference}</span>`;
    } catch (erro) {
        mensagemNome.textContent = 'Lamentamos, mas houve um erro no processo da compra.';
    }
});

if (!localStorage.getItem('produtosNoCesto')) {
    localStorage.setItem('produtosNoCesto','[]');
}

let produtosNoCesto = JSON.parse(localStorage.getItem('produtosNoCesto'));
renderizarCesto(produtosNoCesto);