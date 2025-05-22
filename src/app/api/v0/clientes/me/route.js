import { db } from '@/lib/firebaseAdmin';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Token ausente.' }), { status: 401 });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const clienteSnap = await db.collection('clientes').doc(decoded.id).get();

    if (!clienteSnap.exists) {
      return new Response(JSON.stringify({ error: 'Cliente não encontrado.' }), { status: 404 });
    }

    const cliente = clienteSnap.data();
    delete cliente.senhahash;

    return new Response(JSON.stringify(cliente), { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return new Response(JSON.stringify({ error: 'Erro no token ou banco de dados.' }), { status: 500 });
  }
}
//"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI5MjIzNzhlLTQwMmItNGU5MS1hYzc4LTg5M2I3Nzc1NjVjNCIsImVtYWlsIjoibWFyaXF1aW5oYUBlbWFpbC5jb20iLCJpYXQiOjE3NDc4NzI3ODAsImV4cCI6MTc0Nzg3NjM4MH0.7E1ChSDN_4WlVNfDWzOGbGjrMx4hp_mDG2mSBPjGdDc"