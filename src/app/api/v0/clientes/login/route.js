import { mysqlPool } from '@/lib/mysql';
import { verifyPassword } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return new Response(JSON.stringify({ error: 'Email e senha são obrigatórios.' }), { status: 400 });
    }

    // Buscar o usuário no MySQL
    const conn = await mysqlPool.getConnection();
    const [rows] = await conn.query('SELECT * FROM clientes WHERE email = ?', [email]);
    conn.release();

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Usuário não encontrado.' }), { status: 404 });
    }

    const user = rows[0];

    // Verificar se a senha está correta
    const isMatch = await verifyPassword(senha, user.senhahash);

    if (!isMatch) {
      return new Response(JSON.stringify({ error: 'Senha incorreta.' }), { status: 401 });
    }

    // Gerar token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    // Atualizar o campo 'ultimo_login' no banco de dados
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const conn2 = await mysqlPool.getConnection();
    await conn2.query('UPDATE clientes SET ultimo_login = ? WHERE id = ?', [now, user.id]);
    conn2.release();

    // Remover hash da senha antes de enviar o usuário
    delete user.senhahash;

    return new Response(JSON.stringify({ message: 'Login bem-sucedido', user, token }), { status: 200 });
  } catch (error) {
    console.error('Erro no login:', error);
    return new Response(JSON.stringify({ error: 'Erro no login.' }), { status: 500 });
  }
}