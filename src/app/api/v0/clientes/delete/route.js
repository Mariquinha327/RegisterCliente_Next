import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { verifyToken } from '@/lib/auth';
import { mysqlConn } from '@/lib/mysql';

export async function DELETE(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return new Response(JSON.stringify({ error: 'Token ausente.' }), { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    await deleteDoc(doc(db, 'clientes', decoded.id));
    await mysqlConn.query('DELETE FROM clientes WHERE id = ?', [decoded.id]);

    return new Response(JSON.stringify({ message: 'Conta removida com sucesso.' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao remover conta.' }), { status: 500 });
  }
}
