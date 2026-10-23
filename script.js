console.log("script carregado");

const form = document.getElementById("busca");
const inputCidade = document.getElementById("cidade");
const mensagem = document.getElementById("mensagem");
const resultado = document.getElementById("resultado");

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    console.log("evento disparado");

    const cidade = inputCidade.value.trim();
    if(!cidade) return;

    mensagem.textContent = "Buscando...";
    resultado.classList.add("hidden");

    //busca cidade, clima e exibe o result.
    try {
        const coordenadas = await buscarCoordenadas(cidade);
        const clima = await buscarClima(coordenadas);
        mostrarClima(coordenadas.nome, clima);
        mensagem.textContent = "";
    } catch (erro) {
        console.error("erro capturado", erro);
        mensagem.textContent = erro.message;
    }
});

// buscar coordenadas da cidade
async function buscarCoordenadas(cidade) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error("Não foi possível buscar a cidade.");

    const dados = await resposta.json();
    if(!dados.results || dados.results.length === 0) {
        throw new Error("Cidade não encontrada. Verifique o nome digitado.")
    }
    
    const cidadeEncontrada = dados.results[0];
    return {
        latitude: cidadeEncontrada.latitude,
        longitude: cidadeEncontrada.longitude,
        nome: cidadeEncontrada.name,
    };
}

//buscar clima
async function buscarClima({ latitude, longitude }) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error("Não foi possível obter o clima.");

    const dados = await resposta.json();
    return dados.current;
}

//mostrar os dados
function mostrarClima(nomeCidade, clima) {
    document.getElementById("nome-cidade").textContent = nomeCidade;
    document.getElementById("temperatura").textContent = `${clima.temperature_2m}°C`;
    document.getElementById("umidade").textContent = `Umidade: ${clima.relative_humidity_2m}%`;
    document.getElementById("vento").textContent = `Vento: ${clima.wind_speed_10m} km/h`;
    resultado.classList.remove("hidden");
}