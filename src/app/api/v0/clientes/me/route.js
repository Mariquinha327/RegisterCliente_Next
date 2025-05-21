import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return new Response(JSON.stringify({ error: 'Token ausente.' }), { status: 401 });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const docRef = doc(db, 'clientes', decoded.id);
    const clienteSnap = await getDoc(docRef);

    if (!clienteSnap.exists()) return new Response(JSON.stringify({ error: 'Cliente não encontrado.' }), { status: 404 });

    const cliente = clienteSnap.data();
    delete cliente.senhahash;

    return new Response(JSON.stringify(cliente), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Token inválido.' }), { status: 401 });
  }
}
