# 🥐 Debug Pastelaria - Guia de Configuração Final

Este pacote contém **TUDO** o que você precisa para fazer o aplicativo funcionar, desde o banco de dados até a geração do APK para Android.

---

## 1. Banco de Dados (Supabase)
O erro de "Infinite Recursion" foi resolvido. Siga estes passos:
1. Acesse o seu painel do [Supabase](https://supabase.com).
2. Vá em **SQL Editor**.
3. Copie todo o conteúdo do arquivo `schema.sql` que está nesta pasta.
4. **Importante**: Se houver políticas (Policies) antigas nas tabelas `usuarios`, `pedidos`, `itens_pedido` ou `tickets`, delete-as no painel (Authentication -> Policies) para evitar conflitos.
5. Cole o código no SQL Editor e clique em **Run**.

---

## 2. Configuração do App
1. Certifique-se de que as suas chaves do Supabase estão corretas no arquivo `supabaseConfig.ts`.
2. No terminal da pasta do projeto, instale as dependências:
   ```bash
   npm install
   ```

---

## 3. Como Gerar o APK (Android)
O arquivo `app.json` já está configurado com o nome do pacote `com.debug.pastelaria`.

1. Instale o EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Faça login:
   ```bash
   eas login
   ```
3. Configure o build (se ainda não fez):
   ```bash
   eas build:configure
   ```
4. **Gere o APK** usando o perfil de preview que configuramos no `eas.json`:
   ```bash
   eas build -p android --profile preview
   ```

---

## 4. O que foi corrigido?
- **Erro 42P17 (Recursão Infinita)**: Resolvido com uma função `is_admin()` de segurança.
- **Carrinho**: Agora é isolado por usuário (cada conta tem seu próprio carrinho).
- **ADM**: Redirecionamento automático para o painel administrativo se a coluna `adm` for `true`.
- **Checkout**: Finalização de pedido e geração de tickets de sorteio funcionando 100%.
- **Build**: `app.json` corrigido para evitar erros na hora de compilar o APK.

**Bom trabalho com a sua Pastelaria! 🚀**
