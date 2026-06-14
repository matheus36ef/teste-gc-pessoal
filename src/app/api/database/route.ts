import { NextResponse } from 'next/server';
import { docker, ensureNetwork, ensureImage, sanitizeName, NETWORK_NAME } from '@/lib/docker-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const containers = await docker.listContainers({ all: true });
    const dbContainers = containers
      .filter(c => c.Labels && c.Labels['minha-nuvem-type'] === 'database')
      .map(c => ({
        id: c.Id,
        name: c.Names[0].replace(/^\//, ''),
        image: c.Image,
        status: c.State === 'running' ? 'online' : 'offline',
        ports: c.Ports.filter(p => p.PublicPort).map(p => `${p.PublicPort}->${p.PrivatePort}`).join(', ')
      }));

    return NextResponse.json({ status: 'success', databases: dbContainers });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, engine, password } = body;

    if (!name || !engine || !password) {
      return NextResponse.json({ status: 'error', message: 'Faltam campos obrigatórios' }, { status: 400 });
    }

    const safeName = sanitizeName(name);
    if (!safeName) return NextResponse.json({ status: 'error', message: 'Nome inválido' }, { status: 400 });

    let image = '';
    let env: string[] = [];
    let portBindings: any = {};
    let exposedPorts: any = {};
    const internalPort = engine === 'postgres' ? '5432' : '6379';

    if (engine === 'postgres') {
      image = 'postgres:15-alpine';
      env = [`POSTGRES_PASSWORD=${password}`, `POSTGRES_USER=admin`, `POSTGRES_DB=${safeName}`];
      portBindings = { '5432/tcp': [{ HostPort: '0' }] };
      exposedPorts = { '5432/tcp': {} };
    } else if (engine === 'redis') {
      image = 'redis:7-alpine';
      env = [];
      portBindings = { '6379/tcp': [{ HostPort: '0' }] };
      exposedPorts = { '6379/tcp': {} };
    } else {
      return NextResponse.json({ status: 'error', message: 'Engine não suportada' }, { status: 400 });
    }

    await ensureNetwork();
    await ensureImage(image);

    const containerName = `db-${safeName}`;

    // Tenta remover se já existe um container parado com esse nome
    try {
      const old = docker.getContainer(containerName);
      await old.remove({ force: true });
    } catch (e) {}

    const container = await docker.createContainer({
      Image: image,
      name: containerName,
      Env: env,
      ExposedPorts: exposedPorts,
      HostConfig: {
        PortBindings: portBindings,
        RestartPolicy: { Name: 'always' },
        NetworkMode: NETWORK_NAME
      },
      Labels: {
        'minha-nuvem-type': 'database'
      }
    });

    await container.start();

    // Inspecionar para pegar a porta real alocada pelo Docker
    const info = await container.inspect();
    const networkSettings = info.NetworkSettings;
    const allocatedPort = networkSettings.Ports[`${internalPort}/tcp`]?.[0]?.HostPort || 'Desconhecida';

    return NextResponse.json({ 
      status: 'success', 
      message: 'Banco de dados criado com sucesso!',
      allocatedPort
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
