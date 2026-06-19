import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.join(__dirname, 'src');

const mappings = [
  { appFile: 'app/(dashboard)/dashboard/page.tsx', featureFile: 'features/dashboard/components/dashboard-page.tsx' },
  { appFile: 'app/(dashboard)/students/page.tsx', featureFile: 'features/students/components/students-page.tsx' },
  { appFile: 'app/(dashboard)/students/[id]/page.tsx', featureFile: 'features/students/components/student-profile-page.tsx' },
  { appFile: 'app/(dashboard)/teachers/page.tsx', featureFile: 'features/teachers/components/teachers-page.tsx' },
  { appFile: 'app/(dashboard)/teachers/[id]/page.tsx', featureFile: 'features/teachers/components/teacher-profile-page.tsx' },
  { appFile: 'app/(dashboard)/attendance/page.tsx', featureFile: 'features/attendance/components/attendance-page.tsx' },
  { appFile: 'app/(dashboard)/exams/page.tsx', featureFile: 'features/exams/components/exams-page.tsx' },
  { appFile: 'app/(dashboard)/timetable/page.tsx', featureFile: 'features/timetable/components/timetable-page.tsx' },
  { appFile: 'app/(dashboard)/fees/page.tsx', featureFile: 'features/fees/components/fees-page.tsx' },
  { appFile: 'app/(dashboard)/notifications/page.tsx', featureFile: 'features/notifications/components/notifications-page.tsx' },
  { appFile: 'app/(dashboard)/settings/page.tsx', featureFile: 'features/settings/components/settings-page.tsx' },
  { appFile: 'app/(auth)/login/page.tsx', featureFile: 'features/auth/components/login-page.tsx' },
  { appFile: 'app/(auth)/register/page.tsx', featureFile: 'features/auth/components/register-page.tsx' }
];

async function run() {
  for (const { appFile, featureFile } of mappings) {
    const fullAppFile = path.join(baseDir, appFile);
    const fullFeatureFile = path.join(baseDir, featureFile);
    
    try {
      let content = await fs.readFile(fullAppFile, 'utf8');
      
      const match = content.match(/export\s+default\s+function\s+([a-zA-Z0-9_]+)/);
      if (!match) {
        console.error(`Could not find export default function in ${appFile}`);
        continue;
      }
      const compName = match[1];
      
      const newContent = content.replace(
        new RegExp(`export\\s+default\\s+function\\s+${compName}`),
        `export function ${compName}`
      );
      
      await fs.mkdir(path.dirname(fullFeatureFile), { recursive: true });
      await fs.writeFile(fullFeatureFile, newContent, 'utf8');
      
      const importPath = `@/${featureFile.replace(/\\/g, '/').replace('.tsx', '')}`;
      let wrapperContent = `import { ${compName} } from "${importPath}";\n\n`;
      wrapperContent += `export default function Page(props: any) {\n  return <${compName} {...props} />;\n}\n`;
      
      await fs.writeFile(fullAppFile, wrapperContent, 'utf8');
      console.log(`Successfully refactored ${appFile} -> ${featureFile}`);
    } catch (e) {
      console.error(`Failed to process ${appFile}: ${e.message}`);
    }
  }
}

run();
