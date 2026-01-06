/**
 * Data Source Abstraction Layer
 *
 * Exports the appropriate data source based on NEXT_PUBLIC_DATA_MODE:
 * - demo: Uses faker-generated mock data (default)
 * - live: Connects to real backend API
 *
 * Usage:
 *   import { dataSource } from '@/lib/data-source'
 *   const profile = await dataSource.getProfile()
 */

import { getDataMode, type DataSource } from './types'
import { stubDataSource } from './stub'
import { liveDataSource } from './live'

// Export types
export type { DataSource, DataMode, ApiResult } from './types'
export { getDataMode } from './types'

// Get the appropriate data source based on environment
function getDataSource(): DataSource {
    const mode = getDataMode()

    if (mode === 'live') {
        console.log('[DataSource] Using LIVE data source')
        return liveDataSource
    }

    console.log('[DataSource] Using DEMO data source (faker)')
    return stubDataSource
}

// Export the data source singleton
export const dataSource: DataSource = getDataSource()

// Export individual data sources for testing
export { stubDataSource } from './stub'
export { liveDataSource } from './live'
export { resetStubData } from './stub'
