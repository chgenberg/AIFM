import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

/**
 * Importera exporterade examples till AI Knowledge Base
 * 
 * Kör: npx tsx scripts/import-task-examples.ts
 */
async function importExamples() {
  console.log('📥 Importerar examples till Knowledge Base...');

  // Läs exporterade examples
  const examplesPath = 'approved-tasks-examples.json';
  
  if (!fs.existsSync(examplesPath)) {
    console.error(`❌ Filen ${examplesPath} finns inte. Kör först export-approved-tasks.ts`);
    process.exit(1);
  }

  const examples = JSON.parse(fs.readFileSync(examplesPath, 'utf-8'));

  console.log(`📊 Laddar ${examples.length} examples från fil...`);

  // Hitta modellen
  const model = await prisma.aIModel.findFirst({
    where: {
      name: 'bank-recon-expert',
      taskKind: 'BANK_RECON',
    },
  });

  if (!model) {
    console.error('❌ Modellen "bank-recon-expert" hittades inte. Kör först seed-ai-models.ts');
    process.exit(1);
  }

  console.log(`✅ Använder modell: ${model.name} v${model.version}`);

  // Lägg till varje exempel
  let imported = 0;
  let skipped = 0;

  for (const example of examples) {
    try {
      // Kontrollera om exemplet redan finns (baserat på input-hash)
      const inputHash = JSON.stringify(example.input);
      
      const existing = await prisma.aIModelExample.findFirst({
        where: {
          modelId: model.id,
          input: example.input as any,
        },
      });

      if (existing) {
        console.log(`⏭️  Skippar duplicat: ${example.metadata.clientName}`);
        skipped++;
        continue;
      }

      await prisma.aIModelExample.create({
        data: {
          modelId: model.id,
          name: `Real Task: ${example.metadata.clientName} - ${example.metadata.approvedAt.split('T')[0]}`,
          input: example.input,
          output: example.output,
          tags: example.tags,
          isActive: true,
          usageCount: 0,
          successRate: 1.0, // Start with 100% (approved task)
        },
      });

      imported++;
      console.log(`✅ Importerade: ${example.metadata.clientName}`);
    } catch (error: any) {
      console.error(`❌ Fel vid import av ${example.metadata.clientName}:`, error.message);
    }
  }

  console.log(`\n✨ Import klar!`);
  console.log(`   ✅ Importerade: ${imported}`);
  console.log(`   ⏭️  Skippade: ${skipped}`);
  console.log(`   📊 Totalt examples i modellen: ${imported + (await prisma.aIModelExample.count({ where: { modelId: model.id } }))}`);
}

importExamples()
  .catch((e) => {
    console.error('Error importing examples:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

