# 🔧 Como Atualizar o TELEGRAM_CHAT_ID

## ❌ Problema Identificado

O grupo do Telegram foi atualizado para **supergrupo** e o ID mudou de formato. Por isso os pedidos não estão sendo enviados para o Telegram.

## ✅ Solução - Passo a Passo

### 1️⃣ Descobrir o Novo ID do Supergrupo

Existem 2 formas de descobrir o novo ID:

#### **Opção A: Usando o Bot @userinfobot (Mais Fácil)**
1. Abra o grupo do Telegram onde você quer receber os pedidos
2. Adicione o bot **@userinfobot** ao grupo
3. O bot enviará automaticamente uma mensagem mostrando o ID do grupo
4. Copie o ID (vai começar com `-100` seguido de números)
   - Exemplo: `-1001234567890`

#### **Opção B: Usando o Bot @raw_data_bot**
1. Adicione o bot **@raw_data_bot** ao grupo
2. Envie qualquer mensagem no grupo
3. O bot responderá com os dados do grupo, incluindo o `chat.id`
4. Copie o valor do `chat.id`

### 2️⃣ Atualizar a Secret no Supabase

1. Acesse o painel do Supabase do projeto
2. Vá em **Project Settings** → **Edge Functions** → **Secrets**
3. Procure a secret `TELEGRAM_CHAT_ID`
4. Clique em **Edit** (ícone de lápis)
5. Cole o novo ID do supergrupo (começando com `-100`)
6. Salve as alterações

### 3️⃣ Reiniciar as Edge Functions (se necessário)

Após atualizar a secret, as edge functions podem precisar de alguns minutos para recarregar. Se não funcionar imediatamente:

1. Aguarde 2-3 minutos
2. Faça um teste atribuindo um motoboy a um pedido
3. Se ainda não funcionar, tente fazer um novo deploy das edge functions

## 📝 Exemplo de IDs

- **Grupo normal** (antigo): `-123456789`
- **Supergrupo** (novo): `-1001234567890`

Perceba que o supergrupo tem `-100` no início e depois os números do ID original.

## ✅ Testando

Depois de atualizar:
1. Faça um novo pedido de delivery
2. Atribua um motoboy ao pedido
3. Verifique se a mensagem apareceu no grupo do Telegram

## ❓ Dúvidas

Se o problema persistir após atualizar o ID:
- Verifique se o bot tem permissão para enviar mensagens no grupo
- Confirme que o bot ainda está no grupo
- Verifique se o TELEGRAM_BOT_TOKEN ainda está correto
