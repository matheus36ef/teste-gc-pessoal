import { NextResponse } from 'next/server';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const containers = await docker.listContainers({ all: true });
    const minioContainer = containers.find(c => c.Names.includes('/cloud-storage-minio'));

    if (minioContainer) {
      return NextResponse.json({ 
        status: 'success', 
        storage: {
          status: minioContainer.State === 'running' ? 'online' : 'offline',
          consolePort: 9001,
          apiPort: 9000
        }
      });
    }

    return NextResponse.json({ status: 'success', storage: null });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'deploy') {
      // Faz o pull da imagem
      await new Promise((resolve, reject) => {
        docker.pull('minio/minio:latest', (err: any, stream: any) => {
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
        Image: 'minio/minio:latest',
        name: 'cloud-storage-minio',
        Cmd: ['server', '/data', '--console-address', ':9001'],
        Env: [
          'MINIO_ROOT_USER=admin',
          'MINIO_ROOT_PASSWORD=minioadmin123'
        ],
        ExposedPorts: {
          '9000/tcp': {},
          '9001/tcp': {}
        },
        HostConfig: {
          PortBindings: {
            '9000/tcp': [{ HostPort: '9000' }],
            '9001/tcp': [{ HostPort: '9001' }]
          },
          RestartPolicy: { Name: 'always' }
        },
        Labels: {
          'minha-nuvem-type': 'storage'
        }
      });

      await container.start();

      return NextResponse.json({ status: 'success', message: 'Servidor de Storage iniciado!' });
    }

    return NextResponse.json({ status: 'error', message: 'Ação inválida' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
