import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, senha } = await req.json();

    const q = query(collection(db, 'clientes'), where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return new Response(JSON.stringify({ error: 'Cliente não encontrado.' }), { status: 404 });

    const clienteDoc = snapshot.docs[0];
    const cliente = clienteDoc.data();

    const senhaValida = await verifyPassword(senha, cliente.senhahash);
    if (!senhaValida) return new Response(JSON.stringify({ error: 'Senha incorreta.' }), { status: 401 });

    const token = generateToken({ id: cliente.id });
    await updateDoc(doc(db, 'clientes', cliente.id), { ultimo_login: new Date().toISOString() });

    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro no login.' }), { status: 500 });
  }
}