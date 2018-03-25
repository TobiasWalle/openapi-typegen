import * as fs from 'fs';
import * as http from 'http';
import { IncomingMessage } from 'http';
import { IOpenApiObject } from 'open-api.d.ts';

export function getSchema(path: string): Promise<IOpenApiObject> {
  if (isNetworkPath(path)) {
    return getSchemaFromNetwork(path);
  }
  return getSchemaFromFile(path);
}

function isNetworkPath(path: string): boolean {
  const regExp = /(?:^|[ \t])((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/;
  return regExp.test(path);
}

function getSchemaFromNetwork(url: string): Promise<IOpenApiObject> {
  return new Promise<IOpenApiObject>((resolve, reject) => {
    http.get(url, async (res) => {
      try {
        validateResponse(res);
        const json = await getJsonFromResponse(res);
        resolve(json as any);
      } catch (err) {
        reject(err);
      }
    });
  });
}

function validateResponse(res: IncomingMessage): void {
  const { statusCode } = res;
  const contentType = res.headers['content-type'];

  if (statusCode !== 200) {
    throw new Error(`Error while fetching the schema. Status code ${statusCode}.`);
  } else if (!/^application\/json/.test(contentType!)) {
    throw new Error(`Expected content-type "application/json" but received "${contentType}"`);
  }
}

function getJsonFromResponse(res: IncomingMessage): Promise<object> {
  res.setEncoding('utf8');

  let rawData = '';
  return new Promise<object>((resolve, reject) => {
    res.on('data', chunk => rawData += chunk);
    res.on('end', () => {
      try {
        resolve(JSON.parse(rawData));
      } catch (err) {
        reject(err);
      }
    }).on('error', reject);
  });
}

function getSchemaFromFile(path: string): Promise<IOpenApiObject> {
  return new Promise<IOpenApiObject>((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
  });
}
