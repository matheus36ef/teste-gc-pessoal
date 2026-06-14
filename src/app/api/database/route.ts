import { NextResponse } from 'next/server';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const containers = await docker.listContainers({ all: true });
    // Filtra apenas containers que criamos com o label db
    const dbContainers = containers
      .filter(c => c.Labels && c.Labels['minha-nuvem-type'] === 'database')
      .map(c => ({
        id: c.Id,
        name: c.Names[0].replace(/^\//, ''),
        image: c.Image,
        status: c.State === 'running' ? 'online' : 'offline',
        ports: c.Ports.map(p => `${p.PublicPort}->${p.PrivatePort}`).join(', ')
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

    let image = '';
    let env: string[] = [];
    let portBindings: any = {};
    let exposedPorts: any = {};

    if (engine === 'postgres') {
      image = 'postgres:15-alpine';
      env = [`POSTGRES_PASSWORD=${password}`, `POSTGRES_USER=admin`, `POSTGRES_DB=${name}`];
      portBindings = { '5432/tcp': [{ HostPort: '0' }] }; // Porta aleatória no host
      exposedPorts = { '5432/tcp': {} };
    } else if (engine === 'redis') {
      image = 'redis:7-alpine';
      env = [];
      portBindings = { '6379/tcp': [{ HostPort: '0' }] };
      exposedPorts = { '6379/tcp': {} };
    } else {
      return NextResponse.json({ status: 'error', message: 'Engine não suportada' }, { status: 400 });
    }

    // Faz o pull da imagem de forma silenciosa e espera
    await new Promise((resolve, reject) => {
      docker.pull(image, (err: any, stream: any) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, onFinished, onProgress);
        function onFinished(err: any, output: any) {
          if (err) return reject(err);
          resolve(output);
        }
        function onProgress(event: any) {}
      });
    });

    const container = await docker.createContainer({
      Image: image,
      name: `db-${name}`,
      Env: env,
      ExposedPorts: exposedPorts,
      HostConfig: {
        PortBindings: portBindings,
        RestartPolicy: { Name: 'always' }
      },
      Labels: {
        'minha-nuvem-type': 'database'
      }
    });

    await container.start();

    return NextResponse.json({ status: 'success', message: 'Banco de dados criado com sucesso!' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
