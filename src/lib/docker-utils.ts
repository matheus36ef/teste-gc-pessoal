import Docker from 'dockerode';

export const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

export const NETWORK_NAME = 'minha-nuvem-network';

// Garante que a rede padrão da plataforma exista
export async function ensureNetwork() {
  try {
    const networks = await docker.listNetworks();
    const exists = networks.some(n => n.Name === NETWORK_NAME);
    if (!exists) {
      await docker.createNetwork({ Name: NETWORK_NAME, Driver: 'bridge' });
    }
  } catch (e) {
    console.warn("Aviso: Não foi possível checar/criar a rede Docker.", e);
  }
}

// Faz o pull da imagem apenas se ela não existir localmente (muito mais rápido e não dá timeout)
export async function ensureImage(imageName: string) {
  try {
    const images = await docker.listImages();
    const exists = images.some(img => img.RepoTags && img.RepoTags.includes(imageName));
    
    if (!exists) {
      console.log(`Baixando imagem ${imageName}...`);
      await new Promise((resolve, reject) => {
        docker.pull(imageName, (err: any, stream: any) => {
          if (err) return reject(err);
          docker.modem.followProgress(stream, onFinished, onProgress);
          function onFinished(err: any, output: any) {
            if (err) return reject(err);
            resolve(output);
          }
          function onProgress(event: any) {}
        });
      });
    }
  } catch (error) {
    throw new Error(`Falha ao preparar a imagem ${imageName}: ` + (error as Error).message);
  }
}

// Sanitiza strings para serem nomes seguros de containers
export function sanitizeName(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
}
