import { db } from '@/lib/firebaseAdmin'; // Firebase Admin para backend
import { verifyToken } from '@/lib/auth';
import { mysqlPool } from '@/lib/mysql';

export async function PUT(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Token ausente.' }), { status: 401 });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token); // decodifica e valida o token
    const updateData = await req.json();

    // Atualizar no Firebase Admin
    await db.collection('clientes').doc(decoded.id).update(updateData);

    // Atualizar no MySQL
    const conn = await mysqlPool.getConnection();
    await conn.query('UPDATE clientes SET ? WHERE id = ?', [updateData, decoded.id]);
    conn.release();

    return new Response(JSON.stringify({ message: 'Dados atualizados com sucesso.' }), { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    return new Response(JSON.stringify({ error: 'Erro ao atualizar dados.' }), { status: 500 });
  }
}