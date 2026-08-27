-- exadata_migration_template.sql
-- Template de migração: copie dados do schema de origem para o novo schema/owner Exadata.
-- Ajuste as variáveis abaixo antes de executar.

-- CONFIGURAÇÃO (substitua os valores conforme seu ambiente)
-- SOURCE_DBLINK: nome do database link apontando para a origem (ou NULL se executar localmente)
-- SOURCE_SCHEMA: schema do qual os dados serão lidos
-- TARGET_OWNER: owner/usuário que receberá as tabelas Exadata
-- TARGET_TABLESPACE: tablespace ASM/Exadata onde as tabelas serão criadas
-- BATCH_SIZE: tamanho de cada commit no caso de inserts massivos

DEFINE SOURCE_DBLINK = '';
DEFINE SOURCE_SCHEMA = 'LEGACY_SCHEMA';
DEFINE TARGET_OWNER = 'APP_OWNER';
DEFINE TARGET_TABLESPACE = 'EXADATA_TS';
DEFINE BATCH_SIZE = 10000;

SET SERVEROUTPUT ON;

-- Exemplo: criar tabelas no owner destino (assumimos que o DDL já foi aplicado como exadata_model.sql)
-- Caso queira criar novamente com TABLESPACE/OWNER ajustados, descomente e altere OWNER/TABLESPACE.
-- REMEMBER: execute o DDL em conexão com o TARGET_OWNER.

-- 1) Verificações
PROMPT Verificando availability do DBLINK...
BEGIN
  IF '&SOURCE_DBLINK' IS NOT NULL AND LENGTH('&SOURCE_DBLINK')>0 THEN
    BEGIN
      EXECUTE IMMEDIATE 'SELECT 1 FROM DUAL@' || '&SOURCE_DBLINK' ;
      DBMS_OUTPUT.PUT_LINE('DBLINK &SOURCE_DBLINK OK');
    EXCEPTION WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('Falha ao acessar DBLINK &SOURCE_DBLINK - verifique conexão e privilégios');
    END;
  ELSE
    DBMS_OUTPUT.PUT_LINE('Executando em modo LOCAL: sem DBLINK.');
  END IF;
END;
/

PROMPT Desabilitando constraints e triggers no destino (temporário)...
-- Nota: ajustar nomes/owners de constraints conforme necessário.

-- 2) Copiar sequences
PROMPT Criando sequences no owner destino (se não existirem)...
BEGIN
  BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE '||'&TARGET_OWNER'||'.seq_usuarios START WITH 1000 INCREMENT BY 1 NOCACHE NOCYCLE';
  EXCEPTION WHEN OTHERS THEN
    NULL; -- já existe
  END;
  -- Repetir para demais sequences conforme exadata_model.sql
END;
/

PROMPT Iniciando carga de dados por tabela (usar com cuidado: revalide colunas antes de executar)
-- Exemplo para tabela USUARIOS
-- Se estiver usando DBLINK, coloque: FROM &SOURCE_SCHEMA..usuarios@&SOURCE_DBLINK
-- Nota: ajustar lista de colunas para preservar ordem e tipos

-- Exemplo: Carga em modo direto com APPEND
INSERT /*+ APPEND */ INTO usuarios (id_usuario, nickname, nome, email, matricula, cargo, departamento, ativo, ultimo_acesso, data_criacao)
SELECT id_usuario, nickname, nome, email, matricula, cargo, departamento, ativo, ultimo_acesso, data_criacao
FROM &SOURCE_SCHEMA..usuarios@&SOURCE_DBLINK;

COMMIT;

-- Exemplo: Carga de PROCESSOS (usar em blocos se tabela for muito grande)
-- Recomenda-se particionar a carga por intervalo de data (ex: data_entrada BETWEEN x AND y) para paralelismo.

-- Exemplo de fragmento para um ano específico:
INSERT /*+ APPEND */ INTO processos (id_processo, processo_external_id, assunto, requerente, orgao_origem, data_entrada, prazo_final, prazo_area_tecnica, situacao, responsavel_id, documento_sei, especial, observacao, id_operadora)
SELECT id_processo, processo_external_id, assunto, requerente, orgao_origem, data_entrada, prazo_final, prazo_area_tecnica, situacao, responsavel_id, documento_sei, especial, observacao, id_operadora
FROM &SOURCE_SCHEMA..processos@&SOURCE_DBLINK
WHERE data_entrada BETWEEN TO_DATE('2020-01-01','YYYY-MM-DD') AND TO_DATE('2020-12-31','YYYY-MM-DD');

COMMIT;

-- Repetir para outros períodos, ou automatizar com PL/SQL loop por intervalos.

-- 3) Após carga em massa: rebuild de índices e coletar estatísticas
PROMPT Reconstruindo índices locais e coletando estatísticas...
-- Reconstruir índices específicos
BEGIN
  EXECUTE IMMEDIATE 'ALTER INDEX ux_usuarios_nickname REBUILD';
  EXECUTE IMMEDIATE 'ALTER INDEX idx_processos_responsavel REBUILD';
  EXECUTE IMMEDIATE 'ALTER INDEX idx_processos_situacao REBUILD';
  EXECUTE IMMEDIATE 'ALTER INDEX idx_processos_prazo_final REBUILD';
  EXECUTE IMMEDIATE 'ALTER INDEX idx_pendencias_processo REBUILD';
  EXECUTE IMMEDIATE 'ALTER INDEX idx_documentos_processo_tipo REBUILD';
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
/

-- Gather stats
BEGIN
  DBMS_STATS.GATHER_SCHEMA_STATS(OWNNAME => '&TARGET_OWNER', CASCADE => TRUE);
END;
/
PROMPT Migração concluída (template). Revise logs e execute validações de integridade.

-- Atenção: este arquivo é um template. Personalize antes da execução em produção.
COMMIT;
