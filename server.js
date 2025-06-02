import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password', // Altere conforme sua configuração
  database: 'salao_beleza',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Função auxiliar para executar queries
async function executeQuery(query, params = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
}

// ==================== ROTAS DE CLIENTES ====================

// Listar todos os clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await executeQuery('SELECT * FROM Cliente ORDER BY nome');
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Buscar cliente por ID
app.get('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await executeQuery('SELECT * FROM Cliente WHERE id = ?', [id]);
    
    if (cliente.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(cliente[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// Criar novo cliente
app.post('/api/clientes', async (req, res) => {
  try {
    const { nome, cpf, telefone, nascimento } = req.body;
    
    if (!nome || !cpf || !telefone) {
      return res.status(400).json({ error: 'Nome, CPF e telefone são obrigatórios' });
    }
    
    const result = await executeQuery(
      'INSERT INTO Cliente (nome, cpf, telefone, nascimento) VALUES (?, ?, ?, ?)',
      [nome, cpf, telefone, nascimento]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Cliente criado com sucesso' 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'CPF já cadastrado' });
    } else {
      res.status(500).json({ error: 'Erro ao criar cliente' });
    }
  }
});

// Atualizar cliente
app.put('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, telefone, nascimento } = req.body;
    
    const result = await executeQuery(
      'UPDATE Cliente SET nome = ?, cpf = ?, telefone = ?, nascimento = ? WHERE id = ?',
      [nome, cpf, telefone, nascimento, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json({ message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Deletar cliente
app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery('DELETE FROM Cliente WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

// ==================== ROTAS DE PROFISSIONAIS ====================

// Listar todos os profissionais
app.get('/api/profissionais', async (req, res) => {
  try {
    const profissionais = await executeQuery(`
      SELECT p.*, GROUP_CONCAT(e.nome) as especialidades
      FROM Profissional p
      LEFT JOIN Profissional_Especialidade pe ON p.id = pe.profissional_id
      LEFT JOIN Especialidade e ON pe.especialidade_id = e.id
      GROUP BY p.id
      ORDER BY p.nome
    `);
    res.json(profissionais);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar profissionais' });
  }
});

// Buscar profissional por ID
app.get('/api/profissionais/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profissional = await executeQuery(`
      SELECT p.*, GROUP_CONCAT(e.nome) as especialidades
      FROM Profissional p
      LEFT JOIN Profissional_Especialidade pe ON p.id = pe.profissional_id
      LEFT JOIN Especialidade e ON pe.especialidade_id = e.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);
    
    if (profissional.length === 0) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }
    
    res.json(profissional[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar profissional' });
  }
});

// Criar novo profissional
app.post('/api/profissionais', async (req, res) => {
  try {
    const { nome, cpf, cargo } = req.body;
    
    if (!nome || !cpf || !cargo) {
      return res.status(400).json({ error: 'Nome, CPF e cargo são obrigatórios' });
    }
    
    const result = await executeQuery(
      'INSERT INTO Profissional (nome, cpf, cargo) VALUES (?, ?, ?)',
      [nome, cpf, cargo]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Profissional criado com sucesso' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar profissional' });
  }
});

// ==================== ROTAS DE AGENDAMENTOS ====================

// Listar todos os agendamentos
app.get('/api/agendamentos', async (req, res) => {
  try {
    const agendamentos = await executeQuery(`
      SELECT 
        a.id,
        a.data,
        a.hora,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        p.nome as profissional_nome,
        s.nome as servico_nome,
        s.valor as servico_valor,
        s.duracao as servico_duracao,
        sl.nome as sala_nome
      FROM Agendamento a
      JOIN Cliente c ON a.cliente_id = c.id
      JOIN Profissional p ON a.profissional_id = p.id
      JOIN Servico s ON a.servico_id = s.id
      JOIN Sala sl ON a.sala_id = sl.id
      ORDER BY a.data DESC, a.hora DESC
    `);
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

// Buscar agendamentos por cliente (nome ou ID)
app.get('/api/agendamentos/cliente/:identificador', async (req, res) => {
  try {
    const { identificador } = req.params;
    
    // Verifica se é um ID (número) ou nome
    const isId = !isNaN(identificador);
    
    let query = `
      SELECT 
        a.id,
        a.data,
        a.hora,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        p.nome as profissional_nome,
        s.nome as servico_nome,
        s.valor as servico_valor,
        s.duracao as servico_duracao,
        sl.nome as sala_nome
      FROM Agendamento a
      JOIN Cliente c ON a.cliente_id = c.id
      JOIN Profissional p ON a.profissional_id = p.id
      JOIN Servico s ON a.servico_id = s.id
      JOIN Sala sl ON a.sala_id = sl.id
      WHERE ${isId ? 'c.id = ?' : 'c.nome LIKE ?'}
      ORDER BY a.data DESC, a.hora DESC
    `;
    
    const params = isId ? [identificador] : [`%${identificador}%`];
    const agendamentos = await executeQuery(query, params);
    
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos do cliente' });
  }
});

// Verificar horários disponíveis de um profissional em uma data
app.get('/api/profissionais/:id/horarios-disponiveis/:data', async (req, res) => {
  try {
    const { id, data } = req.params;
    
    // Buscar agendamentos existentes do profissional na data
    const agendamentosExistentes = await executeQuery(`
      SELECT a.hora, s.duracao
      FROM Agendamento a
      JOIN Servico s ON a.servico_id = s.id
      WHERE a.profissional_id = ? AND a.data = ?
      ORDER BY a.hora
    `, [id, data]);
    
    // Horários de funcionamento (8h às 18h, intervalos de 30 min)
    const horariosBase = [];
    for (let hora = 8; hora < 18; hora++) {
      horariosBase.push(`${hora.toString().padStart(2, '0')}:00:00`);
      horariosBase.push(`${hora.toString().padStart(2, '0')}:30:00`);
    }
    
    // Filtrar horários ocupados
    const horariosOcupados = new Set();
    
    agendamentosExistentes.forEach(agendamento => {
      const horaInicio = agendamento.hora;
      const duracao = agendamento.duracao; // em minutos
      
      // Converter hora para minutos
      const [h, m] = horaInicio.split(':').map(Number);
      const inicioMinutos = h * 60 + m;
      const fimMinutos = inicioMinutos + duracao;
      
      // Marcar todos os slots ocupados
      for (let minuto = inicioMinutos; minuto < fimMinutos; minuto += 30) {
        const hora = Math.floor(minuto / 60);
        const min = minuto % 60;
        const horarioFormatado = `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00`;
        horariosOcupados.add(horarioFormatado);
      }
    });
    
    const horariosDisponiveis = horariosBase.filter(horario => !horariosOcupados.has(horario));
    
    res.json({
      data,
      profissional_id: id,
      horarios_disponiveis: horariosDisponiveis,
      agendamentos_existentes: agendamentosExistentes
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar horários disponíveis' });
  }
});

// Criar novo agendamento
app.post('/api/agendamentos', async (req, res) => {
  try {
    const { data, hora, cliente_id, profissional_id, servico_id, sala_id } = req.body;
    
    if (!data || !hora || !cliente_id || !profissional_id || !servico_id || !sala_id) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    // Verificar conflito de horário do profissional
    const conflito = await executeQuery(`
      SELECT a.id, s.duracao, a.hora
      FROM Agendamento a
      JOIN Servico s ON a.servico_id = s.id
      WHERE a.profissional_id = ? AND a.data = ?
    `, [profissional_id, data]);
    
    // Buscar duração do serviço atual
    const servicoAtual = await executeQuery('SELECT duracao FROM Servico WHERE id = ?', [servico_id]);
    if (servicoAtual.length === 0) {
      return res.status(400).json({ error: 'Serviço não encontrado' });
    }
    
    const duracaoAtual = servicoAtual[0].duracao;
    const [horaAtual, minutoAtual] = hora.split(':').map(Number);
    const inicioAtualMinutos = horaAtual * 60 + minutoAtual;
    const fimAtualMinutos = inicioAtualMinutos + duracaoAtual;
    
    // Verificar conflitos
    for (const agendamento of conflito) {
      const [horaExistente, minutoExistente] = agendamento.hora.split(':').map(Number);
      const inicioExistenteMinutos = horaExistente * 60 + minutoExistente;
      const fimExistenteMinutos = inicioExistenteMinutos + agendamento.duracao;
      
      // Verificar sobreposição
      if (
        (inicioAtualMinutos < fimExistenteMinutos && fimAtualMinutos > inicioExistenteMinutos)
      ) {
        return res.status(400).json({ 
          error: 'Conflito de horário: profissional já possui agendamento neste horário' 
        });
      }
    }
    
    const result = await executeQuery(
      'INSERT INTO Agendamento (data, hora, cliente_id, profissional_id, servico_id, sala_id) VALUES (?, ?, ?, ?, ?, ?)',
      [data, hora, cliente_id, profissional_id, servico_id, sala_id]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Agendamento criado com sucesso' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

// Atualizar agendamento
app.put('/api/agendamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, hora, cliente_id, profissional_id, servico_id, sala_id } = req.body;
    
    const result = await executeQuery(
      'UPDATE Agendamento SET data = ?, hora = ?, cliente_id = ?, profissional_id = ?, servico_id = ?, sala_id = ? WHERE id = ?',
      [data, hora, cliente_id, profissional_id, servico_id, sala_id, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    res.json({ message: 'Agendamento atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

// Deletar agendamento
app.delete('/api/agendamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery('DELETE FROM Agendamento WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    res.json({ message: 'Agendamento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar agendamento' });
  }
});

// ==================== ROTAS DE PAGAMENTOS ====================

// Listar todos os pagamentos
app.get('/api/pagamentos', async (req, res) => {
  try {
    const pagamentos = await executeQuery(`
      SELECT 
        p.*,
        c.nome as cliente_nome,
        s.nome as servico_nome,
        s.valor as servico_valor,
        a.data as agendamento_data,
        a.hora as agendamento_hora
      FROM Pagamento p
      JOIN Agendamento a ON p.agendamento_id = a.id
      JOIN Cliente c ON a.cliente_id = c.id
      JOIN Servico s ON a.servico_id = s.id
      ORDER BY p.data_pagamento DESC
    `);
    res.json(pagamentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pagamentos' });
  }
});

// Buscar pagamento por ID do agendamento
app.get('/api/pagamentos/agendamento/:agendamento_id', async (req, res) => {
  try {
    const { agendamento_id } = req.params;
    const pagamento = await executeQuery(`
      SELECT 
        p.*,
        c.nome as cliente_nome,
        s.nome as servico_nome,
        s.valor as servico_valor,
        a.data as agendamento_data,
        a.hora as agendamento_hora
      FROM Pagamento p
      JOIN Agendamento a ON p.agendamento_id = a.id
      JOIN Cliente c ON a.cliente_id = c.id
      JOIN Servico s ON a.servico_id = s.id
      WHERE p.agendamento_id = ?
    `, [agendamento_id]);
    
    if (pagamento.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    
    res.json(pagamento[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pagamento' });
  }
});

// Registrar novo pagamento
app.post('/api/pagamentos', async (req, res) => {
  try {
    const { agendamento_id, valor_pago, forma_pagamento, data_pagamento } = req.body;
    
    if (!agendamento_id || !valor_pago || !forma_pagamento) {
      return res.status(400).json({ error: 'Agendamento ID, valor pago e forma de pagamento são obrigatórios' });
    }
    
    // Verificar se o agendamento existe
    const agendamento = await executeQuery('SELECT id FROM Agendamento WHERE id = ?', [agendamento_id]);
    if (agendamento.length === 0) {
      return res.status(400).json({ error: 'Agendamento não encontrado' });
    }
    
    const dataFinal = data_pagamento || new Date().toISOString().split('T')[0];
    
    const result = await executeQuery(
      'INSERT INTO Pagamento (agendamento_id, valor_pago, forma_pagamento, data_pagamento) VALUES (?, ?, ?, ?)',
      [agendamento_id, valor_pago, forma_pagamento, dataFinal]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Pagamento registrado com sucesso' 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Pagamento já registrado para este agendamento' });
    } else {
      res.status(500).json({ error: 'Erro ao registrar pagamento' });
    }
  }
});

// ==================== ROTAS AUXILIARES ====================

// Listar serviços
app.get('/api/servicos', async (req, res) => {
  try {
    const servicos = await executeQuery('SELECT * FROM Servico ORDER BY nome');
    res.json(servicos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// Listar salas
app.get('/api/salas', async (req, res) => {
  try {
    const salas = await executeQuery('SELECT * FROM Sala ORDER BY nome');
    res.json(salas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar salas' });
  }
});

// Listar especialidades
app.get('/api/especialidades', async (req, res) => {
  try {
    const especialidades = await executeQuery('SELECT * FROM Especialidade ORDER BY nome');
    res.json(especialidades);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar especialidades' });
  }
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API do Salão de Beleza funcionando!', 
    timestamp: new Date().toISOString() 
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📋 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🧪 Teste a API em: http://localhost:${PORT}/api/test`);
});