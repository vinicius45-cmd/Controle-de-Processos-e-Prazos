Exadata Model — README

Resumo
------
Este diretório contém o script `exadata_model.sql` com o modelo físico recomendado para Oracle Exadata, incluindo particionamento, compressão HCC e índices locais.

Pré-requisitos
--------------
- Oracle Database Enterprise Edition com Exadata Storage (HCC habilitado).
- Tablespaces em ASM montados nas Storage Cells.
- Permissões de DBA para criar tablespaces/partições e executar operações MOVE para compressão.

Como aplicar
-----------
1. Defina os placeholders de owner/tablespace antes de executar o script:

```sql
DEFINE APP_OWNER = 'APP_OWNER';
DEFINE DATA_TS = 'EXADATA_TS';
```

2. Execute o script em um ambiente de staging antes de produção:

```sql
-- no SQL*Plus / SQLcl / SQL Developer
@exadata_model.sql
```

3. Valide planos de execução e compressão com:

```sql
@exadata_validation.sql
```

4. Para conversão de partições antigas para HCC (exemplo):

```sql
ALTER TABLE processos MOVE PARTITION p_2021 COMPRESS FOR QUERY HIGH;
ALTER INDEX idx_processos_responsavel REBUILD PARALLEL 4;
```

Notas e recomendações
---------------------
- HCC só é efetivo em storage Cells/ASM; verifique o ambiente antes de aplicar `COMPRESS FOR ARCHIVE`.
- Planeje janela de manutenção para `ALTER TABLE ... MOVE PARTITION` e rebuild de índices.
- Use `NOLOGGING` com cautela durante cargas massivas e reabilite logging/rebuilds após o processo.
- Monitore `V$CELL` e `DBA_HIST` para verificar uso de Smart Scan e Storage Index.

Próximos passos sugeridos
-------------------------
- Validar os nomes das colunas/constraints com o schema atual do backend.
- Gerar scripts de migração de dados (ETL) para popular as novas tabelas com mínima janela de downtime.
- Criar job que converta partições imutáveis para HCC conforme política de retenção (ex.: 12-24 meses).

Contato
------
Se quiser, eu adapto o script para o schema exato do backend e crio os scripts de migração e validação de Smart Scan.
