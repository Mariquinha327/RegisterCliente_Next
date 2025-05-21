import { db } from '@/lib/firebaseAdmin'; // Firebase Admin SDK
import { hashPassword } from '@/lib/auth';
import { mysqlPool } from '@/lib/mysql'; // <-- usando pool aqui
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const body = await req.json();
    const { nome, email, telefone, senha, site_url, setor, localizacao } = body;

    const id = uuidv4();
    const senhahash = await hashPassword(senha);

    // Formatar data para MySQL
    const now = new Date();
    const formatDateForMySQL = now.toISOString().slice(0, 19).replace('T', ' ');

    const data = {
      id,
      nome,
      email,
      telefone,
      senhahash,
      site_url,
      setor,
      localizacao: localizacao || null,
      plano_ativo: false,
      data_registo: formatDateForMySQL,
      ultimo_login: null,
    };

    // Salvar no Firebase
    await db.collection('clientes').doc(id).set(data);

    // Salvar no MySQL
    const conn = await mysqlPool.getConnection();
    await conn.query('INSERT INTO clientes SET ?', data);
    conn.release(); // libera a conexão de volta para o pool

    return new Response(JSON.stringify({ message: 'Cliente registado com sucesso.' }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao registar cliente.' }), { status: 500 });
  }
}