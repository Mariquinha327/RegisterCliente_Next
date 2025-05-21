import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { hashPassword } from '@/lib/auth';
import { mysqlConn } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const body = await req.json();
    const { nome, email, telefone, senha, site_url, setor, localizacao } = body;

    const id = uuidv4();
    const senhahash = await hashPassword(senha);
    const now = new Date().toISOString();

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
      data_registo: now,
      ultimo_login: null,
    };

    await setDoc(doc(db, 'clientes', id), data);
    await mysqlConn.query('INSERT INTO clientes SET ?', data);

    return new Response(JSON.stringify({ message: 'Cliente registado com sucesso.' }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao registar cliente.' }), { status: 500 });
  }
}