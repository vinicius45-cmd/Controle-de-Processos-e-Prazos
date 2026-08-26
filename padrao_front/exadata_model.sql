-- DDL Exadata-Ready: sequences, tabelas, índices
-- Ajuste OWNER/TABLESPACE conforme ambiente.
-- Exemplo de execução via SQL*Plus/SQLcl:
--   DEFINE APP_OWNER = 'APP_OWNER'
--   DEFINE DATA_TS = 'EXADATA_TS'
--   @exadata_model.sql

DEFINE APP_OWNER = 'APP_OWNER'
DEFINE DATA_TS = 'EXADATA_TS'

ALTER SESSION SET CURRENT_SCHEMA = &&APP_OWNER;

-- Sequences
CREATE SEQUENCE seq_usuarios START WITH 1000 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_processos START WITH 100000 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_pendencias START WITH 1000000 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_documentos START WITH 2000000 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_audit START WITH 9000000 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_operadoras START WITH 1000 INCREMENT BY 1 NOCACHE NOCYCLE;

-- USUARIOS
CREATE TABLE usuarios (
  id_usuario            NUMBER(12) PRIMARY KEY,
  nickname              VARCHAR2(150 CHAR) NOT NULL,
  nome                  VARCHAR2(400 CHAR),
  email                 VARCHAR2(200 CHAR),
  matricula             VARCHAR2(50 CHAR),
  cargo                 VARCHAR2(200 CHAR),
  departamento          VARCHAR2(200 CHAR),
  ativo                 CHAR(1) DEFAULT 'S',
  ultimo_acesso         TIMESTAMP WITH TIME ZONE,
  data_criacao          TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP
) COMPRESS FOR OLTP
TABLESPACE &&DATA_TS
NOPARALLEL
LOGGING;

CREATE UNIQUE INDEX ux_usuarios_nickname ON usuarios(nickname) NOLOGGING;

-- OPERADORAS
CREATE TABLE operadoras (
  id_operadora NUMBER(10) PRIMARY KEY,
  nm_operadora VARCHAR2(400 CHAR) NOT NULL
) COMPRESS FOR OLTP
TABLESPACE &&DATA_TS
NOPARALLEL
LOGGING;

-- PROCESSOS (PARTITIONED BY data_entrada RANGE + SUBPARTITION HASH on responsavel_id)
CREATE TABLE processos (
  id_processo           NUMBER(12) NOT NULL,
  processo_external_id  VARCHAR2(50 CHAR),
  assunto               VARCHAR2(1000 CHAR),
  requerente            VARCHAR2(500 CHAR),
  orgao_origem          VARCHAR2(200 CHAR),
  data_entrada          DATE,
  prazo_final           DATE,
  prazo_area_tecnica    DATE,
  situacao              VARCHAR2(50 CHAR),
  responsavel_id        NUMBER(12),
  documento_sei         VARCHAR2(100 CHAR),
  especial              CHAR(1) DEFAULT 'N',
  observacao            CLOB,
  id_operadora          NUMBER(10),
  CONSTRAINT pk_processos PRIMARY KEY (id_processo)
)
PARTITION BY RANGE (data_entrada)
INTERVAL (NUMTOYMINTERVAL(1,'YEAR'))
SUBPARTITION BY HASH (responsavel_id)
SUBPARTITIONS 8
(
  PARTITION p_init VALUES LESS THAN (TO_DATE('2023-01-01','YYYY-MM-DD'))
)
COMPRESS FOR OLTP
TABLESPACE &&DATA_TS
NOPARALLEL
LOGGING;

ALTER TABLE processos ENABLE ROW MOVEMENT;

-- índice único para external id (possivelmente global, criar local único por partição não suportado diretamente; usar função de aplicação para garantir unicidade)
CREATE UNIQUE INDEX ux_processos_external_id ON processos (processo_external_id) NOLOGGING;

-- Índices locais (escolha LOCAL para alinhar com partições)
CREATE INDEX idx_processos_responsavel ON processos (responsavel_id) LOCAL NOLOGGING;
CREATE INDEX idx_processos_situacao ON processos (situacao) LOCAL NOLOGGING;
CREATE INDEX idx_processos_prazo_final ON processos (prazo_final) LOCAL NOLOGGING;

-- PENDENCIAS (PARTITION BY prazo_final MONTHLY + subpartition HASH responsavel)
CREATE TABLE pendencias (
  id_pendencia        NUMBER(12) PRIMARY KEY,
  id_processo         NUMBER(12) NOT NULL,
  titulo              VARCHAR2(400 CHAR),
  setor               VARCHAR2(200 CHAR),
  dias_restantes      NUMBER(6),
  status              VARCHAR2(30 CHAR),
  data_criacao        DATE,
  prazo_final         DATE,
  responsavel_id      NUMBER(12)
)
PARTITION BY RANGE (prazo_final)
INTERVAL (NUMTOYMINTERVAL(1,'MONTH'))
SUBPARTITION BY HASH (responsavel_id)
SUBPARTITIONS 4
(
  PARTITION p_pendencias_init VALUES LESS THAN (TO_DATE('2023-01-01','YYYY-MM-DD'))
)
COMPRESS FOR OLTP
TABLESPACE &&DATA_TS
NOPARALLEL
LOGGING;

CREATE INDEX idx_pendencias_processo ON pendencias (id_processo) LOCAL NOLOGGING;
CREATE INDEX idx_pendencias_status ON pendencias (status) LOCAL NOLOGGING;
CREATE INDEX idx_pendencias_responsavel ON pendencias (responsavel_id) LOCAL NOLOGGING;

-- DOCUMENTOS (grande volume) — compressão HCC Archive
CREATE TABLE documentos (
  id_documento    NUMBER(12) PRIMARY KEY,
  id_processo     NUMBER(12) NOT NULL,
  tipo_documento  VARCHAR2(100 CHAR),
  documento_sei   VARCHAR2(200 CHAR),
  conteudo        CLOB,
  data_inclusao   DATE DEFAULT SYSDATE
)
PARTITION BY RANGE (data_inclusao)
INTERVAL (NUMTOYMINTERVAL(1,'YEAR'))
(
  PARTITION p_docs_init VALUES LESS THAN (TO_DATE('2023-01-01','YYYY-MM-DD'))
)
-- HCC is applied at tablespace/partition level; we declare archive compression intent:
COMPRESS FOR ARCHIVE HIGH
TABLESPACE &&DATA_TS
NOPARALLEL
LOGGING;

-- índice local por processo e tipo
CREATE INDEX idx_documentos_processo_tipo ON documentos (id_processo, tipo_documento) LOCAL NOLOGGING;

-- AUDIT LOG (histórico) — compressão HCC Archive
CREATE TABLE audit_log (
  id_evento      NUMBER(12) PRIMARY KEY,
  tabela_alvo    VARCHAR2(100 CHAR),
  id_registro    NUMBER(12),
  usuario        VARCHAR2(150 CHAR),
  evento_tipo    VARCHAR2(50 CHAR),
  dados_antes    CLOB,
  dados_depois   CLOB,
  data_evento    TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP
)
PARTITION BY RANGE (TRUNC(data_evento))
INTERVAL (NUMTOYMINTERVAL(1,'MONTH'))
(
  PARTITION p_audit_init VALUES LESS THAN (TO_DATE('2023-01-01','YYYY-MM-DD'))
)
COMPRESS FOR ARCHIVE HIGH
TABLESPACE &&DATA_TS
NOPARALLEL
LOGGING;

CREATE INDEX idx_audit_tabela ON audit_log (tabela_alvo) LOCAL NOLOGGING;
CREATE INDEX idx_audit_data ON audit_log (data_evento) LOCAL NOLOGGING;

-- Foreign keys (adicionar com NOVALIDATE se existir massa antiga)
ALTER TABLE processos ADD CONSTRAINT fk_processos_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuarios(id_usuario) ENABLE NOVALIDATE;
ALTER TABLE processos ADD CONSTRAINT fk_processos_operadora FOREIGN KEY (id_operadora) REFERENCES operadoras(id_operadora) ENABLE NOVALIDATE;

ALTER TABLE pendencias ADD CONSTRAINT fk_pendencias_processo FOREIGN KEY (id_processo) REFERENCES processos(id_processo) ENABLE NOVALIDATE;
ALTER TABLE pendencias ADD CONSTRAINT fk_pendencias_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuarios(id_usuario) ENABLE NOVALIDATE;

ALTER TABLE documentos ADD CONSTRAINT fk_documentos_processo FOREIGN KEY (id_processo) REFERENCES processos(id_processo) ENABLE NOVALIDATE;

-- Exemplo de política de compressão por partição (migrar partições antigas para HCC quando imutáveis)
-- Exemplo: mover a partição de 2021 para HCC QUERY HIGH (executar com manutenção/Janela de downtime)
-- ALTER TABLE processos MOVE PARTITION p_2021 COMPRESS FOR QUERY HIGH;

-- Observações operacionais (executar como DBA):
-- 1) Colocar tablespaces em ASM com CELL (Exadata). HCC só funciona em Storage Cells/ASM. 
-- 2) Configurar recuperação/retention e rotina que converta partições antigas para HCC (EX: move partition → compress for query high).  
-- 3) Monitorar Storage Indexes; evitar funções em predicados para habilitar Smart Scan.  
-- 4) Para cargas em massa, usar direct-path inserts + NOLOGGING onde aplicável e depois reconstruir índices.

COMMIT;
