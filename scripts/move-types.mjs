import { Project, SyntaxKind } from "ts-morph";
import * as fs from "fs";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

// Create new types files
const typesDir = project.getDirectory("src/types") || project.createDirectory("src/types");
let apiTypesFile = project.getSourceFile("src/types/api.types.ts");
if (!apiTypesFile) {
  apiTypesFile = project.createSourceFile("src/types/api.types.ts", "", { overwrite: true });
}

const seenNames = new Set();
const renameMap = new Map();

// Helper to ensure unique names
function getUniqueName(baseName, filePath) {
  if (!seenNames.has(baseName)) {
    seenNames.add(baseName);
    return baseName;
  }
  
  // Create a domain prefix from the folder path (e.g., 'src/features/admin' -> 'Admin')
  const parts = filePath.split('/');
  const featureIndex = parts.indexOf('features');
  let prefix = "";
  if (featureIndex !== -1 && featureIndex + 1 < parts.length) {
    const domain = parts[featureIndex + 1];
    prefix = domain.charAt(0).toUpperCase() + domain.slice(1);
    // remove hyphens and capitalize
    prefix = prefix.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }
  
  let newName = prefix + baseName;
  let counter = 1;
  while (seenNames.has(newName)) {
    newName = prefix + baseName + counter;
    counter++;
  }
  
  seenNames.add(newName);
  return newName;
}

const sourceFiles = project.getSourceFiles("src/features/**/*.{ts,tsx}");
console.log(`Analyzing ${sourceFiles.length} files in src/features...`);

let movedCount = 0;

for (const sourceFile of sourceFiles) {
  const filePath = sourceFile.getFilePath();
  
  // Find all exported interfaces
  const interfaces = sourceFile.getInterfaces().filter(i => i.isExported() && !i.isDefaultExport());
  for (const intf of interfaces) {
    const oldName = intf.getName();
    const newName = getUniqueName(oldName, filePath);
    
    if (oldName !== newName) {
      console.log(`Renaming ${oldName} to ${newName} in ${filePath}`);
      intf.rename(newName);
    }
    
    // Copy the structure to the new file
    apiTypesFile.addInterface({
      name: newName,
      isExported: true,
      properties: intf.getProperties().map(p => p.getStructure()),
      extends: intf.getExtends().map(e => e.getText())
    });
    
    // Add import to original file
    sourceFile.addImportDeclaration({
      namedImports: [newName],
      moduleSpecifier: "@/types/api.types"
    });
    
    // Remove from original file
    intf.remove();
    movedCount++;
  }

  // Find all exported type aliases
  const typeAliases = sourceFile.getTypeAliases().filter(t => t.isExported() && !t.isDefaultExport());
  for (const typeAlias of typeAliases) {
    const oldName = typeAlias.getName();
    const newName = getUniqueName(oldName, filePath);
    
    if (oldName !== newName) {
      console.log(`Renaming ${oldName} to ${newName} in ${filePath}`);
      typeAlias.rename(newName);
    }
    
    apiTypesFile.addTypeAlias({
      name: newName,
      isExported: true,
      type: typeAlias.getTypeNode().getText(),
      typeParameters: typeAlias.getTypeParameters().map(p => p.getStructure())
    });
    
    // Add import to original file
    sourceFile.addImportDeclaration({
      namedImports: [newName],
      moduleSpecifier: "@/types/api.types"
    });
    
    // Remove from original file
    typeAlias.remove();
    movedCount++;
  }
}

// Ensure api.types.ts is exported from index.ts
let indexFile = project.getSourceFile("src/types/index.ts");
if (indexFile) {
  const exports = indexFile.getExportDeclarations();
  const hasApiExport = exports.some(e => e.getModuleSpecifierValue() === "./api.types");
  if (!hasApiExport) {
    indexFile.addExportDeclaration({
      moduleSpecifier: "./api.types"
    });
  }
}

console.log(`Moved ${movedCount} types/interfaces to src/types/api.types.ts!`);
console.log("Saving changes...");
project.saveSync();
console.log("Done!");
