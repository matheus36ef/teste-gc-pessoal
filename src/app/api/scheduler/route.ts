import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const dbPath = path.join(process.cwd(), 'scheduler.json');

// Garante que o arquivo existe
async function getDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return { jobs: [] };
  }
}

async function saveDb(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const db = await getDb();
    return NextResponse.json({ status: 'success', jobs: db.jobs });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, schedule, command } = body;

    if (!name || !schedule || !command) {
      return NextResponse.json({ status: 'error', message: 'Faltam campos obrigatórios' }, { status: 400 });
    }

    const db = await getDb();
    
    const newJob = {
      id: Date.now().toString(),
      name,
      schedule,
      command,
      status: 'active',
      lastRun: 'Nunca'
    };

    db.jobs.push(newJob);
    await saveDb(db);

    // Em um sistema real, aqui chamaríamos um gerenciador de filas como BullMQ ou node-cron
    // Para nosso MVP, apenas salvamos a intenção.

    return NextResponse.json({ status: 'success', message: 'Tarefa agendada com sucesso!' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
