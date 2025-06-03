const http = require('http');
const url = require('url');


const previsoes = {
  "São Paulo": "27°C, ensolarado",
  "Rio de Janeiro": "30°C, nublado",
  "Belo Horizonte": "25°C, chuva fraca",
  "Curitiba": "18°C, garoa",
  "Salvador": "29°C, sol com nuvens"
};


const formularioHTML = `
  <html>
    <head><title>Previsão do Tempo</title></head>
    <body>
      <h1>Escolha uma cidade</h1>
      <form action="/previsao" method="get">
        <select name="cidade">
          <option value="São Paulo">São Paulo</option>
          <option value="Rio de Janeiro">Rio de Janeiro</option>
          <option value="Belo Horizonte">Belo Horizonte</option>
          <option value="Curitiba">Curitiba</option>
          <option value="Salvador">Salvador</option>
        </select>
        <button type="submit">Ver previsão</button>
      </form>
    </body>
  </html>
`;


const servidor = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/formulario') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(formularioHTML);

  } else if (pathname === '/previsao') {
    const cidade = parsedUrl.query.cidade;
    const previsao = previsoes[cidade];

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (previsao) {
      res.end(`<h1>Previsão para ${cidade}: ${previsao}</h1>`);
    } else {
      res.end(`<h1>Cidade não encontrada</h1>`);
    }

  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Página não encontrada');
  }
});


servidor.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000/formulario');
});