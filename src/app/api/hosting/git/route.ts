import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';
import { docker, ensureNetwork, sanitizeName, NETWORK_NAME } from '@/lib/docker-utils';

const execPromise = util.promisify(exec);
export const dynamic = 'force-dynamic';

function getDockerfileTemplate(env: string, installCmd: string, buildCmd: string, startCmd: string, port: string) {
  if (env === 'node') {
    return `
FROM node:20-slim
WORKDIR /app
COPY . .
RUN ${installCmd || 'npm install'}
${buildCmd ? `RUN ${buildCmd}` : ''}
EXPOSE ${port}
CMD ${startCmd.split(' ').map(s => `"${s}"`).join(', ')} 
# Exemplo rudimentar de array CMD, no mundo ideal o formatação de array JSON é melhor, fallback:
CMD sh -c "${startCmd}"
`;
  }
  
  if (env === 'python') {
    return `
FROM python:3.10-slim
WORKDIR /app
COPY . .
RUN ${installCmd || 'pip install -r requirements.txt'}
EXPOSE ${port}
CMD sh -c "${startCmd}"
`;
  }

  // Fallback estático (nginx)
  return `
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY . .
EXPOSE 80
`;
}

export async function POST(req: Request) {
  const safeName = 'git-deploy-' + Date.now();
  let tmpDir = '';

  try {
    const body = await req.json();
    const { name, repoUrl, environment, installCmd, buildCmd, startCmd, port } = body;

    if (!name || !repoUrl || !port) {
      return NextResponse.json({ status: 'error', message: 'Faltam campos obrigatórios' }, { status: 400 });
    }

    const appSafeName = sanitizeName(name);
    if (!appSafeName) return NextResponse.json({ status: 'error', message: 'Nome inválido' }, { status: 400 });

    tmpDir = path.join(process.cwd(), 'tmp-builds', safeName);
    const imageName = `minha-nuvem/app-${appSafeName}`;

    // 1. Criar pasta temporária
    await fs.mkdir(tmpDir, { recursive: true });

    // 2. Clone do repositório
    console.log(`Clonando ${repoUrl}...`);
    await execPromise(`git clone ${repoUrl} ${tmpDir}`);

    // 3. Criar Dockerfile Dinâmico
    const dockerfileContent = getDockerfileTemplate(environment, installCmd, buildCmd, startCmd, port);
    await fs.writeFile(path.join(tmpDir, 'Dockerfile'), dockerfileContent.trim());

    // 4. Build da Imagem Docker via CLI
    console.log(`Executando docker build -t ${imageName} ...`);
    await execPromise(`docker build -t ${imageName} ${tmpDir}`);

    // 5. Apagar pasta temporária
    await fs.rm(tmpDir, { recursive: true, force: true });

    // 6. Subir o Contêiner usando dockerode (aproveitando rede interna)
    await ensureNetwork();

    const portBindings: any = {};
    const exposedPorts: any = {};
    
    exposedPorts[`${port}/tcp`] = {};
    portBindings[`${port}/tcp`] = [{ HostPort: '0' }]; 

    const containerName = `app-${appSafeName}`;

    try {
      const old = docker.getContainer(containerName);
      await old.remove({ force: true });
    } catch (e) {}

    const container = await docker.createContainer({
      Image: imageName,
      name: containerName,
      ExposedPorts: exposedPorts,
      HostConfig: {
        PortBindings: portBindings,
        RestartPolicy: { Name: 'always' },
        NetworkMode: NETWORK_NAME
      },
      Labels: {
        'minha-nuvem-type': 'hosting',
        'minha-nuvem-source': 'git'
      }
    });

    await container.start();

    const info = await container.inspect();
    const allocatedPort = info.NetworkSettings.Ports[`${port}/tcp`]?.[0]?.HostPort || 'Desconhecida';

    return NextResponse.json({ 
      status: 'success', 
      message: 'App clonado, compilado e hospedado com sucesso!',
      allocatedPort
    });
  } catch (error: any) {
    // Tenta limpar em caso de erro
    if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
