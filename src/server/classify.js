import fs from 'fs'
import * as d3 from 'd3'
import * as topojson from 'topojson'
import world from 'world-atlas/world/110m.json'
import rococo from '../js/countries'
import sync from 'csv-parse/lib/sync'

const data = sync(fs.readFileSync('./src/server/export.csv'))
  .filter(row => !row[0].match(/(1989|1990|1991|1992)$/) )

console.log(data.length)

const countries = topojson.feature(world, world.objects.countries).features

const euCodes = `AUT, BEL, BGR, HRV, CYP, CZE, DNK, EST, FIN, FRA, DEU, GRC, HUN, IRL, ITA, LVA, LTU, LUX, MLT, NLD, POL, PRT, ROU, SVK, SVN, ESP, SWE, GBR`
    .split(',').map( c => c.trim())

const eu = countries.filter(f => euCodes.indexOf(rococo.numericToAlpha3[f.id]) >= 0).map(c => c.id)

const channel = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -5.9765625,
                49.210420445650286
              ],
              [
                -2.900390625,
                48.45835188280866
              ],
              [
                2.197265625,
                49.781264058178344
              ],
              [
                5.185546875,
                52.214338608258196
              ],
              [
                9.755859375,
                54.059387886623576
              ],
              [
                15.556640624999998,
                55.727110085045986
              ],
              [
                9.140625,
                61.14323525084058
              ],
              [
                -1.669921875,
                56.12106042504407
              ],
              [
                -9.31640625,
                52.53627304145948
              ],
              [
                -5.9765625,
                49.210420445650286
              ]
            ].slice().reverse()
          ]
        }
      }
    ]
  }

const classified = data.reduce( (agg, row, i) => {

    //console.log(i)

    const p = [ Number(row[8]), Number(row[7]) ]

    let country = countries.find(f => d3.geoContains(f, p))
    
    if(country){
        // the person died on land

        if(eu.indexOf(country.id) >= 0 ) {
            // the person died in an EU country

            const entry = agg['eu']
            return Object.assign({}, agg, { eu : entry ? entry + Number(row[2]) : Number(row[2]) } )

        } else {
            // the person died in another country

            const entry = agg['outside']
            return Object.assign({}, agg, { outside : entry ? entry + Number(row[2]) : Number(row[2]) } )
        }
    }

    else {
        if(d3.geoContains(channel, p)) {
            // the person died in the English Channel (inside the EU)

            //console.log(row)

            const entry = agg['eu']
            return Object.assign({}, agg, { eu : entry ? entry + Number(row[2]) : Number(row[2]) } )

        }
        else {

            const entry = agg['atSea']
            return Object.assign({}, agg, { atSea : entry ? entry + Number(row[2]) : Number(row[2]) } )

        }
    }

}, {})

console.log(classified)

const sum = (a, b) => a + b

const total = Object.entries(classified).map(([k, v]) => v).reduce(sum)

console.log(Object.entries(classified).map(([k, v]) => `${k} : ${v/total}` ).join(', '))