"""
Script ETL Python simples para extrair dados de uma fonte (via cx_Oracle) e inserir no schema Exadata.
Ajuste DSNs, credenciais e mapeamentos conforme seu ambiente.
Requisitos: cx_Oracle (oracledb), tqdm (opcional)
"""
import oracledb
import os
from datetime import datetime
from tqdm import tqdm

# Configurar via variáveis de ambiente (ou alterar aqui)
SRC_DSN = os.getenv('SRC_DSN', 'src_host:1521/ORCL')
SRC_USER = os.getenv('SRC_USER', 'legacy_user')
SRC_PWD = os.getenv('SRC_PWD', 'legacy_pwd')

TGT_DSN = os.getenv('TGT_DSN', 'tgt_host:1521/ORCL')
TGT_USER = os.getenv('TGT_USER', 'app_owner')
TGT_PWD = os.getenv('TGT_PWD', 'app_pwd')

BATCH = int(os.getenv('BATCH_SIZE', '1000'))

# Mapeamento básico de tabelas: ajustar colunas conforme esquema real
TABLES = [
    {
        'name': 'USUARIOS',
        'select': 'SELECT id_usuario, nickname, nome, email, matricula, cargo, departamento, ativo, ultimo_acesso, data_criacao FROM usuarios',
        'insert': 'INSERT INTO usuarios (id_usuario, nickname, nome, email, matricula, cargo, departamento, ativo, ultimo_acesso, data_criacao) VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9,:10)'
    },
    {
        'name': 'PROCESSOS',
        'select': 'SELECT id_processo, processo_external_id, assunto, requerente, orgao_origem, data_entrada, prazo_final, prazo_area_tecnica, situacao, responsavel_id, documento_sei, especial, observacao, id_operadora FROM processos',
        'insert': 'INSERT INTO processos (id_processo, processo_external_id, assunto, requerente, orgao_origem, data_entrada, prazo_final, prazo_area_tecnica, situacao, responsavel_id, documento_sei, especial, observacao, id_operadora) VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14)'
    }
]


def migrate_table(src_conn, tgt_conn, table):
    src_cur = src_conn.cursor()
    tgt_cur = tgt_conn.cursor()

    print(f"Migrando {table['name']}...")
    src_cur.execute(table['select'])

    batch = []
    count = 0

    for row in src_cur:
        batch.append(row)
        if len(batch) >= BATCH:
            tgt_cur.executemany(table['insert'], batch)
            tgt_conn.commit()
            count += len(batch)
            print(f"  {count} registros inseridos...")
            batch = []

    if batch:
        tgt_cur.executemany(table['insert'], batch)
        tgt_conn.commit()
        count += len(batch)
        print(f"  {count} registros inseridos (final).")

    src_cur.close()
    tgt_cur.close()


if __name__ == '__main__':
    print('Conectando fontes...')
    src_conn = oracledb.connect(user=SRC_USER, password=SRC_PWD, dsn=SRC_DSN)
    tgt_conn = oracledb.connect(user=TGT_USER, password=TGT_PWD, dsn=TGT_DSN)

    try:
        for t in TABLES:
            migrate_table(src_conn, tgt_conn, t)

        print('Migração concluída com sucesso.')
    finally:
        src_conn.close()
        tgt_conn.close()
