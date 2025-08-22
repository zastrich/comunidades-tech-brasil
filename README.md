# Como Atualizar o `data.json`

Este guia rápido irá te ajudar a incluir ou editar seus dados no arquivo `data.json` do projeto. O `data.json` é a fonte de dados para os perfis exibidos na página principal.

## Estrutura do `data.json`

O arquivo `data.json` é um array de objetos JSON, onde cada objeto representa um perfil de profissional. Cada perfil possui as seguintes chaves:

-   `nome`: (String) Nome completo do profissional.
-   `foto`: (String) URL da foto de perfil (ex: link do GitHub Avatar).
-   `cargo`: (String) Cargo atual ou principal do profissional.
-   `empresa`: (String) Empresa atual ou última empresa.
-   `segmento`: (String) Segmento de atuação (ex: "Tecnologia").
-   `status`: (String) Status atual (ex: "Disponível", "Contratando", ou vazio).
-   `hardskills`: (Array de Strings) Lista de hard skills (ex: `["React", "Python", "AWS"]`).
-   `softskills`: (Array de Strings) Lista de soft skills (ex: `["Comunicação", "Liderança"]`).
-   `comunidades`: (Array de Strings) Lista de comunidades que participa (ex: `["Node.js Brasil", "React Community"]`).
-   `local`: (Objeto) Contém `cidade` e `estado`.
    -   `cidade`: (String) Cidade de residência.
    -   `estado`: (String) Estado de residência (sigla, ex: "SP", "RJ").
-   `links`: (Objeto) Contém URLs para redes sociais/portfólio.
    -   `linkedin`: (String) URL do perfil do LinkedIn.
    -   `github`: (String) URL do perfil do GitHub.
    -   `portfolio`: (String) URL do portfólio pessoal (pode ser vazio).

**Exemplo de um objeto de perfil:**

```json
{
  "nome": "Seu Nome Completo",
  "foto": "https://link.para.sua/foto.jpg",
  "cargo": "Desenvolvedor Fullstack",
  "empresa": "Sua Empresa Ltda.",
  "segmento": "Tecnologia",
  "status": "Disponível",
  "hardskills": [
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB"
  ],
  "softskills": [
    "Resolução de Problemas",
    "Trabalho em Equipe"
  ],
  "comunidades": [
    "Minha Comunidade Tech",
    "Outra Comunidade"
  ],
  "local": {
    "cidade": "Sua Cidade",
    "estado": "UF"
  },
  "links": {
    "linkedin": "https://www.linkedin.com/in/seu-usuario",
    "github": "https://github.com/seu-usuario",
    "portfolio": "https://seu-portfolio.com"
  }
}
```
## FORMA 1: Edição Direta pelo GitHub

Para edições rápidas, você pode editar o arquivo `data.json` diretamente pelo GitHub. **Lembre-se que esta ação fará um commit direto na branch `main`. Use com extrema cautela!**

1.  Acesse o arquivo `data.json` diretamente no GitHub através deste link:
    [https://github.com/zastrich/comunidades-tech-brasil/blob/main/data.json](https://github.com/zastrich/comunidades-tech-brasil/blob/main/data.json)
2.  Clique no ícone de lápis (Editar este arquivo) no canto superior direito da visualização do arquivo.
3.  Faça suas alterações no editor online, seguindo a estrutura JSON descrita acima.
4.  Após as alterações, role para baixo, adicione uma mensagem de commit seguindo esse padrão:

```bash
  feat: Adiciona/Atualiza perfil de [Seu Nome] no data.json
```

## FORMA 2: Clonando o repo testando localmente e aí subindo

1.  **Clone o Repositório (se ainda não o fez):**
    ```bash
    git clone https://github.com/SEU_USUARIO/TM-de-Resultados.git
    cd TM-de-Resultados
    ```

2.  **Localize o arquivo `data.json`:**
    Ele está na raiz do projeto.

3.  **Edite o `data.json`:**
    Abra o arquivo `data.json` em seu editor de texto preferido.
    -   Para **incluir um novo perfil**, adicione um novo objeto JSON (seguindo a estrutura acima) ao array, certificando-se de que ele esteja separado por vírgula do objeto anterior e que o último objeto do array **não** tenha vírgula após ele.
    -   Para **editar um perfil existente**, localize o objeto correspondente e altere os valores das chaves desejadas.
    -   **ATENÇÃO:** Mantenha a sintaxe JSON válida (aspas duplas para chaves e valores de string, vírgulas entre itens de arrays e pares chave-valor, etc.). Erros de sintaxe podem quebrar a aplicação.

4.  **Teste Localmente:**
    Antes de enviar suas alterações, verifique se tudo funciona corretamente:
    ```bash
    npx serve
    ```
    Abra `http://localhost:3000` no seu navegador e confira se seus dados aparecem como esperado e se a aplicação continua funcionando sem erros.

## Atualizando no GitHub (Commit Direto na `main`)

**AVISO IMPORTANTE:** Os commits serão feitos diretamente na branch `main`. Use este método com extrema cautela e apenas se tiver certeza de suas alterações. Erros podem afetar diretamente a versão em produção.

Após testar localmente e confirmar que suas alterações estão corretas:

1.  **Adicione o arquivo `data.json` às suas alterações:**
    ```bash
    git add data.json
    ```

2.  **Crie um commit com suas alterações:**
    ```bash
    git commit -m "feat: Adiciona/Atualiza perfil de [Seu Nome] no data.json"
    ```
    (Substitua `[Seu Nome]` pelo seu nome ou uma descrição relevante).

3.  **Envie suas alterações para o GitHub:**
    ```bash
    git push origin main
    ```

Suas alterações estarão visíveis no site após o deploy automático (se configurado).