import { db } from '@/lib/firebaseAdmin'; // Firebase Admin SDK
import { verifyToken } from '@/lib/auth';
import { mysqlPool } from '@/lib/mysql';

export async function DELETE(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Token ausente.' }), { status: 401 });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token); // decodifica e valida o token

    // Deleta do Firestore usando Admin SDK
    await db.collection('clientes').doc(decoded.id).delete();

    // Deleta do MySQL usando pool de conexões
    const conn = await mysqlPool.getConnection();
    await conn.query('DELETE FROM clientes WHERE id = ?', [decoded.id]);
    conn.release();

    return new Response(JSON.stringify({ message: 'Conta removida com sucesso.' }), { status: 200 });
  } catch (error) {
    console.error('Erro ao remover conta:', error);
    return new Response(JSON.stringify({ error: 'Erro ao remover conta.' }), { status: 500 });
  }
}