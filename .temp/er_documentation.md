# Documentação ER — Resumo de entidades e relações

Gerado a partir de `exadata_model.sql` e `src/types/index.ts`.

## Arquivos
- Diagrama Mermaid: [.temp/er_diagram.mmd](.temp/er_diagram.mmd#L1-L200)
- Diagrama PNG: [.temp/er_diagram.png](.temp/er_diagram.png)

## Entidades (resumo)

- USUARIOS
  - PK: `id_usuario`
  - Attributes: `nickname`, `nome`, `email`, `matricula`, `cargo`, `departamento`, `ativo`, `ultimo_acesso`, `data_criacao`

- OPERADORAS
  - PK: `id_operadora`
  - Attributes: `nm_operadora`

- PROCESSOS
  - PK: `id_processo`
  - Attributes: `processo_external_id`, `assunto`, `requerente`, `orgao_origem`, `data_entrada`, `prazo_final`, `prazo_area_tecnica`, `situacao`, `responsavel_id`, `documento_sei`, `especial`, `observacao`, `id_operadora`
  - FKs: `responsavel_id` -> `USUARIOS.id_usuario`, `id_operadora` -> `OPERADORAS.id_operadora`
  - Observações: tabela particionada por `data_entrada` (interval yearly) e subpartition hash por `responsavel_id`; índices locais criados (`idx_*`) e índice único em `processo_external_id`.

- PENDENCIAS
  - PK: `id_pendencia`
  - Attributes: `id_processo`, `titulo`, `setor`, `dias_restantes`, `status`, `data_criacao`, `prazo_final`, `responsavel_id`
  - FKs: `id_processo` -> `PROCESSOS.id_processo`, `responsavel_id` -> `USUARIOS.id_usuario`
  - Observações: particionada por `prazo_final` (interval monthly) com subpartições hash.

- DOCUMENTOS
  - PK: `id_documento`
  - Attributes: `id_processo`, `tipo_documento`, `documento_sei`, `conteudo`, `data_inclusao`
  - FK: `id_processo` -> `PROCESSOS.id_processo`
  - Observações: compressão para archive, particionada por `data_inclusao`.

- AUDIT_LOG
  - PK: `id_evento`
  - Attributes: `tabela_alvo`, `id_registro`, `usuario`, `evento_tipo`, `dados_antes`, `dados_depois`, `data_evento`
  - Observações: particionada por TRUNC(data_evento), compressão HCC archive.

## Sequências relevantes
- `seq_usuarios`, `seq_processos`, `seq_pendencias`, `seq_documentos`, `seq_audit`, `seq_operadoras`

## Índices e constraints
- Índices únicos e locais: `ux_usuarios_nickname`, `ux_processos_external_id`, `idx_*` conforme DDL.
- Constraints FK declaradas com `ENABLE NOVALIDATE` no DDL de exemplo.

## Observações operacionais (rápido)
- Particionamento e compressão HCC foram configurados para Exadata — importante para estratégia de purge/retention.
- Unicidade de `processo_external_id` pode exigir controle por aplicação devido a particionamento.

---

Se quiser, eu:
- salvo o PNG em outro local ou commito os arquivos ao repositório; ou
- gero um SVG em alta resolução; ou
- exploro relações adicionais encontradas em código frontend/back-end.
