import { writeFileSync } from 'node:fs'
import { kitContractOf } from './kitContract.ts'

const views = new URL('../views', import.meta.url).pathname
writeFileSync(new URL('../views/kit-contract.json', import.meta.url), JSON.stringify(kitContractOf(views), null, 2) + '\n')
