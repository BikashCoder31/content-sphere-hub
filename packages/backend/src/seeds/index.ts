import { connectDatabase, disconnectDatabase } from '../config/database.js';
import logger from '../config/logger.js';
import { seedRoles } from './roles.seed.js';
import { seedAdmin } from './admin.seed.js';
import { seedSettings } from './settings.seed.js';

/**
 * Run all seed scripts
 */
async function runSeeds(): Promise<void> {
  logger.info('Starting database seeding...');

  try {
    // Connect to database
    await connectDatabase();

    // Run seeds in order (roles must be first)
    await seedRoles();
    await seedAdmin();
    await seedSettings();

    logger.info('Database seeding completed successfully!');
  } catch (error) {
    logger.error({ err: error }, 'Database seeding failed');
    throw error;
  } finally {
    // Disconnect from database
    await disconnectDatabase();
  }
}

// Run if executed directly
runSeeds()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });

export { seedRoles, seedAdmin, seedSettings };
export default runSeeds;
