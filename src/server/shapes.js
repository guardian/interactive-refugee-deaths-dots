import * as d3 from 'd3'
import PoissonSampler from '../js/poisson-disc-sampler'
import fs from 'fs'

const italy = [
    [ 0, 0 ], [ 4, 0 ], [ 7, 3 ], [ 7, 4 ], [ 6, 4 ], [ 6, 3 ], [ 5, 3 ], [ 5, 5 ],
    [ 3, 5 ], [ 3, 7 ], [ 1, 5 ], [ 3, 5 ], [ 3, 3 ], [ 0, 0 ]
]

const shape = italy // [
//     [ 0, 0 ], [ 10, 0 ], [ 10, 3 ], [ 6, 3 ], [ 6, 2 ], [ 0, 2 ], [ 0, 0 ] 
// ]

const bounds = [ [ 0, 0 ], [ 10, 0 ], [ 10, 10 ], [ 0, 10 ], [ 0, 0 ] ]

const perc = d3.polygonArea(shape)/d3.polygonArea(bounds)

console.log(perc)

const radius = 6
const width = 1200

const n = 4000 //34604

const height = Math.floor(n*(radius**2*Math.PI)/(1.96*width))/perc

const scaledShape = shape.map( ([ x, y ]) => [ x*width/10, y*height/10 ]  )

const scaledBounds = bounds.map( ([ x, y ]) => [ x*width/10, y*height/10 ] )

const sampler = PoissonSampler(width, height, radius)
let sample = null
let ps = []

while((sample = sampler())) {

	if(d3.polygonContains(scaledShape, sample)) { ps.push(sample) }

}

console.log(ps.length)

fs.writeFileSync('./src/server/shape.json', JSON.stringify(ps))