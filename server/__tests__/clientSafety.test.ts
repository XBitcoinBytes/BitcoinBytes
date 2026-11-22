import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
function files(root: string): string[] {
 return readdirSync(root, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(root,e.name)) : [join(root,e.name)]);
}
describe('client red-team regression guard', () => {
 it('never references server secret environment variables', () => {
  const source=files('client/src').filter(p=>/\.(tsx?|json)$/.test(p)).map(p=>readFileSync(p,'utf8')).join('\n');
  expect(source).not.toMatch(/(?:process\.env|import\.meta\.env)\.(?:ADMIN_TOKEN|RAILWAY_API_TOKEN|COINGECKO_API_KEY|REDIS_URL)/);
  expect(source).not.toMatch(/(?:sk-[a-zA-Z0-9]{30,}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----)/);
 });
 it('does not render RSS or other untrusted HTML with innerHTML', () => {
  const source=files('client/src').filter(p=>/\.tsx?$/.test(p)).map(p=>readFileSync(p,'utf8')).join('\n');
  expect(source).not.toMatch(/dangerouslySetInnerHTML/);
 });
 it('does not silently disable type checking',()=>{
  const config=JSON.parse(readFileSync('tsconfig.json','utf8'));
  expect(config.compilerOptions.strict).toBe(true);
  expect(config.include).toContain('server/**/*');
 });
});
