 💇‍♀️ API Sistema de Agendamento - Salão de Beleza

API REST completa para gerenciamento de agendamentos de salão de beleza, otimizada para integração com n8n e automações via WhatsApp.

## 🚀 Funcionalidades

- ✅ **Gestão de Clientes** - CRUD completo
- ✅ **Gestão de Profissionais** - Com especialidades
- ✅ **Sistema de Agendamentos** - Com verificação de conflitos
- ✅ **Controle de Pagamentos** - Múltiplas formas
- ✅ **Consulta de Horários** - Disponibilidade em tempo real
- ✅ **Integração n8n** - Pronto para automações
- ✅ **WhatsApp Ready** - Estruturado para bots

## 🛠️ Tecnologias

- **Node.js** + **Express.js**
- **MySQL** com **mysql2**
- **CORS** habilitado
- **JSON** para todas as comunicações

## 📦 Instalação

```bash
# Clone o repositório
git clona ai o repositorio
cd salao-beleza-api

# Instale as dependências
npm install

# Configure o banco de dados
# 1. Crie o banco MySQL
# 2. Execute o script SQL fornecido
# 3. Configure o .env baseado no .env.example

# Inicie o servidor
npm start
### Teste da API

```plaintext
GET /api/test
```

**Resposta:**

```json
{
  "message": "API do Salão de Beleza funcionando!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 👥 Clientes

### Listar Todos os Clientes

```plaintext
GET /api/clientes
```

**Resposta:**

```json
[
  {
    "id": 1,
    "nome": "Maria Silva",
    "cpf": "12345678901",
    "telefone": "11999999999",
    "nascimento": "1990-05-15"
  }
]
```

### Buscar Cliente por ID

```plaintext
GET /api/clientes/{id}
```

**Exemplo:**

```plaintext
GET /api/clientes/1
```

### Criar Novo Cliente

```plaintext
POST /api/clientes
Content-Type: application/json

{
  "nome": "Maria Silva",
  "cpf": "12345678901",
  "telefone": "11999999999",
  "nascimento": "1990-05-15"
}
```

**Resposta:**

```json
{
  "id": 1,
  "message": "Cliente criado com sucesso"
}
```

### Atualizar Cliente

```plaintext
PUT /api/clientes/{id}
Content-Type: application/json

{
  "nome": "Maria Silva Santos",
  "cpf": "12345678901",
  "telefone": "11888888888",
  "nascimento": "1990-05-15"
}
```

### Deletar Cliente

```plaintext
DELETE /api/clientes/{id}
```

---

## 👨‍💼 Profissionais

### Listar Todos os Profissionais

```plaintext
GET /api/profissionais
```

**Resposta:**

```json
[
  {
    "id": 1,
    "nome": "João Barbeiro",
    "cpf": "98765432100",
    "cargo": "Barbeiro",
    "especialidades": "Corte Masculino,Barba"
  }
]
```

### Buscar Profissional por ID

```plaintext
GET /api/profissionais/{id}
```

### Criar Novo Profissional

```plaintext
POST /api/profissionais
Content-Type: application/json

{
  "nome": "João Barbeiro",
  "cpf": "98765432100",
  "cargo": "Barbeiro"
}
```

---

## 📅 Agendamentos

### Listar Todos os Agendamentos

```plaintext
GET /api/agendamentos
```

**Resposta:**

```json
[
  {
    "id": 1,
    "data": "2024-01-20",
    "hora": "14:00:00",
    "cliente_nome": "Maria Silva",
    "cliente_telefone": "11999999999",
    "profissional_nome": "João Barbeiro",
    "servico_nome": "Corte Feminino",
    "servico_valor": "50.00",
    "servico_duracao": 60,
    "sala_nome": "Sala 1"
  }
]
```

### Buscar Agendamentos por Cliente

```plaintext
GET /api/agendamentos/cliente/{identificador}
```

**Exemplos:**

```plaintext
GET /api/agendamentos/cliente/1          # Por ID
GET /api/agendamentos/cliente/Maria      # Por nome
```

### Verificar Horários Disponíveis

```plaintext
GET /api/profissionais/{id}/horarios-disponiveis/{data}
```

**Exemplo:**

```plaintext
GET /api/profissionais/1/horarios-disponiveis/2024-01-20
```

**Resposta:**

```json
{
  "data": "2024-01-20",
  "profissional_id": "1",
  "horarios_disponiveis": [
    "08:00:00",
    "08:30:00",
    "09:00:00",
    "15:30:00",
    "16:00:00"
  ],
  "agendamentos_existentes": [
    {
      "hora": "14:00:00",
      "duracao": 60
    }
  ]
}
```

### Criar Novo Agendamento

```plaintext
POST /api/agendamentos
Content-Type: application/json

{
  "data": "2024-01-20",
  "hora": "14:00:00",
  "cliente_id": 1,
  "profissional_id": 1,
  "servico_id": 1,
  "sala_id": 1
}
```

**⚠️ Validações Automáticas:**

- Verifica conflito de horário do profissional
- Considera duração do serviço para evitar sobreposições
- Valida existência de cliente, profissional, serviço e sala


### Atualizar Agendamento

```plaintext
PUT /api/agendamentos/{id}
Content-Type: application/json

{
  "data": "2024-01-20",
  "hora": "15:00:00",
  "cliente_id": 1,
  "profissional_id": 1,
  "servico_id": 1,
  "sala_id": 1
}
```

### Deletar Agendamento

```plaintext
DELETE /api/agendamentos/{id}
```

---

## 💰 Pagamentos

### Listar Todos os Pagamentos

```plaintext
GET /api/pagamentos
```

**Resposta:**

```json
[
  {
    "id": 1,
    "agendamento_id": 1,
    "valor_pago": "50.00",
    "forma_pagamento": "PIX",
    "data_pagamento": "2024-01-20",
    "cliente_nome": "Maria Silva",
    "servico_nome": "Corte Feminino",
    "servico_valor": "50.00",
    "agendamento_data": "2024-01-20",
    "agendamento_hora": "14:00:00"
  }
]
```

### Buscar Pagamento por Agendamento

```plaintext
GET /api/pagamentos/agendamento/{agendamento_id}
```

### Registrar Novo Pagamento

```plaintext
POST /api/pagamentos
Content-Type: application/json

{
  "agendamento_id": 1,
  "valor_pago": 50.00,
  "forma_pagamento": "PIX",
  "data_pagamento": "2024-01-20"
}
```

**Formas de Pagamento Aceitas:**

- PIX
- Dinheiro
- Cartão de Crédito
- Cartão de Débito
- Transferência


---

## 🔧 Rotas Auxiliares

### Listar Serviços

```plaintext
GET /api/servicos
```

**Resposta:**

```json
[
  {
    "id": 1,
    "nome": "Corte Feminino",
    "valor": "50.00",
    "duracao": 60
  }
]
```

### Listar Salas

```plaintext
GET /api/salas
```

### Listar Especialidades

```plaintext
GET /api/especialidades
```

---

## 📊 Códigos de Resposta

| Código | Descrição
|-----|-----
| 200 | Sucesso
| 201 | Criado com sucesso
| 400 | Dados inválidos ou conflito
| 404 | Recurso não encontrado
| 500 | Erro interno do servidor


### Exemplos de Erros

**Conflito de Horário:**

```json
{
  "error": "Conflito de horário: profissional já possui agendamento neste horário"
}
```

**Cliente não encontrado:**

```json
{
  "error": "Cliente não encontrado"
}
```

**Dados obrigatórios:**

```json
{
  "error": "Nome, CPF e telefone são obrigatórios"
}
```

---

## 🤖 Exemplos de Uso com n8n

### 1. Webhook para Criar Cliente via WhatsApp

**Trigger:** Webhook
**URL:** `POST /api/clientes`

**Dados do n8n:**

```json
{
  "nome": "{{$json.nome}}",
  "cpf": "{{$json.cpf}}",
  "telefone": "{{$json.telefone}}",
  "nascimento": "{{$json.nascimento}}"
}
```

### 2. Consultar Horários Disponíveis

**HTTP Request Node:**

```plaintext
Method: GET
URL: http://localhost:3000/api/profissionais/{{$json.profissional_id}}/horarios-disponiveis/{{$json.data}}
```

### 3. Criar Agendamento Automático

**HTTP Request Node:**

```json
{
  "data": "{{$json.data}}",
  "hora": "{{$json.hora}}",
  "cliente_id": "{{$json.cliente_id}}",
  "profissional_id": "{{$json.profissional_id}}",
  "servico_id": "{{$json.servico_id}}",
  "sala_id": 1
}
```

### 4. Enviar Confirmação via WhatsApp

**Após criar agendamento, usar os dados retornados:**

```plaintext
Agendamento confirmado! 
📅 Data: {{$json.data}}
🕐 Horário: {{$json.hora}}
👨‍💼 Profissional: {{$json.profissional_nome}}
💇‍♀️ Serviço: {{$json.servico_nome}}
💰 Valor: R$ {{$json.servico_valor}}
```

---

## 🔄 Fluxo Completo de Agendamento

### 1. Cliente solicita agendamento via WhatsApp

```plaintext
"Quero agendar um corte para amanhã às 14h"
```

### 2. n8n processa e consulta disponibilidade

```plaintext
GET /api/profissionais/1/horarios-disponiveis/2024-01-21
```

### 3. Se disponível, cria o agendamento

```plaintext
POST /api/agendamentos
```

### 4. Confirma via WhatsApp

```plaintext
"Agendamento confirmado para 21/01 às 14h com João!"
```

### 5. No dia do serviço, registra pagamento

```plaintext
POST /api/pagamentos
```

---

## 📝 Notas Importantes

1. **Horários de Funcionamento:** 8h às 18h, intervalos de 30 minutos
2. **Conflitos:** A API automaticamente verifica conflitos considerando a duração dos serviços
3. **Formato de Data:** YYYY-MM-DD (ex: 2024-01-20)
4. **Formato de Hora:** HH:MM:SS (ex: 14:00:00)
5. **Telefone:** Recomendado formato com DDD (ex: 11999999999)


---

## 🆘 Suporte

Para dúvidas ou problemas:

1. Verifique se o servidor está rodando na porta 3000
2. Confirme se o banco de dados está configurado corretamente
3. Teste a rota `/api/test` para verificar conectividade
4. Verifique os logs do console para erros específicos


---


```plaintext

Esta documentação completa inclui:

✅ **Todas as rotas disponíveis** com exemplos práticos  
✅ **Códigos de resposta** e tratamento de erros  
✅ **Exemplos específicos para n8n** e automação  
✅ **Fluxo completo** de agendamento via WhatsApp  
✅ **Validações automáticas** e regras de negócio  
✅ **Formatos de dados** padronizados  

A documentação está pronta para ser usada pela equipe e facilitar a integração com n8n e outros sistemas de automação!

<Actions>
  <Action name="Criar collection do Postman" description="Gerar arquivo de collection para testes da API" />
  <Action name="Adicionar exemplos de curl" description="Incluir comandos curl para cada endpoint" />
  <Action name="Documentar webhooks n8n" description="Criar guia específico para configuração de webhooks" />
  <Action name="Criar guia de troubleshooting" description="Adicionar seção de resolução de problemas comuns" />
  <Action name="Gerar schema OpenAPI" description="Criar documentação no formato Swagger/OpenAPI" />
</Actions>


```
