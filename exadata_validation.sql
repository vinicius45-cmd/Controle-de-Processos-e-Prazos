-- exadata_validation.sql
-- Script simples para validar particionamento, compression e possibilidade de Smart Scan.
SET SERVEROUTPUT ON;

PROMPT Validando tabelas particionadas e compression...
SELECT table_name, partitioned, compression, num_rows
FROM user_tables
WHERE table_name IN ('USUARIOS','OPERADORAS','PROCESSOS','PENDENCIAS','DOCUMENTOS','AUDIT_LOG');

PROMPT Validando partições...
SELECT table_name, partition_name, high_value, compression
FROM user_tab_partitions
WHERE table_name IN ('PROCESSOS','PENDENCIAS','DOCUMENTOS','AUDIT_LOG');

PROMPT Validando índices locais...
SELECT index_name, table_name, index_type, locality, compression
FROM user_indexes
WHERE table_name IN ('PROCESSOS','PENDENCIAS','DOCUMENTOS','AUDIT_LOG');

PROMPT Exemplos de consultas para validar Smart Scan (substitua pelos filtros reais do backend):
SELECT 'SELECT * FROM processos WHERE data_entrada BETWEEN DATE ''2024-01-01'' AND DATE ''2024-12-31'' AND situacao = ''EM_ANDAMENTO'';' AS sample_query FROM dual;
SELECT 'SELECT * FROM pendencias WHERE prazo_final BETWEEN DATE ''2024-01-01'' AND DATE ''2024-01-31'' AND status = ''ATRAZADO'';' AS sample_query2 FROM dual;

PROMPT Dica operacional: execute EXPLAIN PLAN e veja se o acesso usa CELL SMART SCAN sem funções em colunas do WHERE.
