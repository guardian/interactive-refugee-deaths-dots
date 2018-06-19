import fs from 'fs'
import sync from 'csv-parse/lib/sync'
import _ from 'lodash'

import { round } from '../js/util'

const data = sync(fs.readFileSync('./src/server/export.csv'))

const sum = (a, b) => a + b

const grouped = _(data)

    .filter(o => !isNaN(Number(o[7])) && !isNaN(Number(o[8])))
    .groupBy( o => {

        return String(round(Number(o[7]), 2)) + '/' + String(round(Number(o[8]), 2))

    } )
    .mapValues( arr => arr.map( o => Number(o[2])).reduce(sum, 0))
    .toPairs()
    .valueOf()

console.log(grouped)

fs.writeFileSync('./src/server/clustered.json', JSON.stringify(grouped))