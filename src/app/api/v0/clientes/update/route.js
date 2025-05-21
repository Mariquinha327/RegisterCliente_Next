import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { verifyToken } from '@/lib/auth';
import { mysqlConn } from '@/lib/mysql';

export async function PUT(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return new Response(JSON.stringify({ error: 'Token ausente.' }), { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const updateData = await req.json();

    await updateDoc(doc(db, 'clientes', decoded.id), updateData);
    await mysqlConn.query('UPDATE clientes SET ? WHERE id = ?', [updateData, decoded.id]);

    return new Response(JSON.stringify({ message: 'Dados atualizados com sucesso.' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro ao atualizar dados.' }), { status: 500 });
  }
}
