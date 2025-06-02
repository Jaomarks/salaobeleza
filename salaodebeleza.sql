CREATE TABLE Cliente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100),
    cpf VARCHAR(11),
    telefone VARCHAR(20),
    nascimento DATE
);

CREATE TABLE Profissional (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100),
    cpf VARCHAR(11),
    cargo VARCHAR(50)
);

CREATE TABLE Especialidade (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50),
    descricao TEXT
);

CREATE TABLE Profissional_Especialidade (
    profissional_id INT,
    especialidade_id INT,
    PRIMARY KEY (profissional_id, especialidade_id),
    FOREIGN KEY (profissional_id) REFERENCES Profissional(id),
    FOREIGN KEY (especialidade_id) REFERENCES Especialidade(id)
);

CREATE TABLE Servico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50),
    valor DECIMAL(8,2),
    duracao INT
);

CREATE TABLE Sala (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50)
);

CREATE TABLE Profissional_Sala (
    profissional_id INT,
    sala_id INT,
    PRIMARY KEY (profissional_id, sala_id),
    FOREIGN KEY (profissional_id) REFERENCES Profissional(id),
    FOREIGN KEY (sala_id) REFERENCES Sala(id)
);

CREATE TABLE Agendamento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data DATE,
    hora TIME,
    cliente_id INT,
    profissional_id INT,
    servico_id INT,
    sala_id INT,
    FOREIGN KEY (cliente_id) REFERENCES Cliente(id),
    FOREIGN KEY (profissional_id) REFERENCES Profissional(id),
    FOREIGN KEY (servico_id) REFERENCES Servico(id),
    FOREIGN KEY (sala_id) REFERENCES Sala(id)
);

CREATE TABLE Pagamento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    agendamento_id INT UNIQUE,
    valor_pago DECIMAL(8,2),
    forma_pagamento VARCHAR(20),
    data_pagamento DATE,
    FOREIGN KEY (agendamento_id) REFERENCES Agendamento(id)
);