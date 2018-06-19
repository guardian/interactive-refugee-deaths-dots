import * as d3 from 'd3'
import * as topojson from 'topojson'
import world from 'world-atlas/world/110m.json'
import { $, $$ } from './util'

import palette from './palette'

import rococo from './countries'

import data from '../server/clustered.json'

import PoissonSampler from './poisson-disc-sampler'

import points from '../server/shape.json'
import { runInDebugContext } from 'vm';

const canvasEl = $('.ref-canvas')

const mobile = window.matchMedia('(max-width: 739px)').matches

const vHeight = window.parent.innerHeight

window.frameElement.style.width = '100%';

const width = canvasEl.clientWidth || canvasEl.getBoundingClientRect().width
const height = mobile ? Math.floor(window.innerWidth*1.75*3.5) :
	2000 //Math.floor(34604*(radius**2*Math.PI)/(1.96*width))

const padding = 10

const adjustScale = d3.scaleSqrt()
	.domain([ 300, 600 ])
	.range([1.4, 1])

const fac = adjustScale(Math.min(600, width))

//console.log('factor:', fac)

const radius = Math.sqrt(1.75*height*width / ( Math.PI*34361*fac ) )

//console.log(width, height, radius)

const canvas = d3.select(canvasEl)
  .attr('width', width*window.devicePixelRatio)
  .attr('height', height*window.devicePixelRatio)

window.resize()

const sampler = PoissonSampler(width - 2*padding, height - 2*padding, radius)
let sample = null

const ctx = canvasEl.getContext('2d')

if(window.devicePixelRatio > 1) {
	ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
}

let ps = []

while((sample = sampler())) {

	ps.push(sample)

}


let progress = 0


// const yScale = progress => d3.scaleLinear().domain([0, progress]).range([0, 1])

// const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5)

// const shuffled = shuffle(ps)

// const delays = ps.map(([x, y]) => [ x, y, Math.random() ])



const offsets = mobile ? ['8.5%', '34%', '69%', '83.25%'] : [ '9%', '34%', '69%', '84%' ]

const annots = $$('.ref-copy')
const labels = $$('.ref-label')

annots.forEach( (el, i) => {
	el.style.top = offsets[i]
} )

const pars = annots.map( a => a.querySelector('p'))

const box1 = $('.ref-container').getBoundingClientRect()

const boxes = pars.map( p => {

	const box2 = p.getBoundingClientRect()
	const bbox = {
		top : box2.top - 18 - box1.top,
		left : box2.left - 10 - box1.left,
		height : box2.height + 30,
		width : box2.width + 20
	}

	return bbox

})

const labelBoxes = labels.map( l => {

	const box2 = l.getBoundingClientRect()

	return {
		top : box2.top - 6 - box1.top ,
		left : box2.left - 5 - box1.left,
		height : box2.height + 9,
		width : box2.width + 10
	}

})

const circles = [] //[ { x : 800, y : 600, r : 50 } ]

const inBox = (o, bbox, rf) => {
	return o.x > bbox.left && o.x < (bbox.left + bbox.width) && o.y > (bbox.top + Math.random()*rf) && o.y < (bbox.top + bbox.height - Math.random()*rf)
}

const sorted = ps.slice()

	.map(([x, y]) => [ x + padding, y + padding ] )
	.map(([x, y]) => ({ x, y })).sort((a, b) => a.y - b.y + (-25 + Math.random()*50))
	.filter( o => {

		if(boxes.some( box => inBox(o, box, 4) ) ) { return false }
		if(labelBoxes.some( box => inBox(o, box, 4) )) { return false }
		return true
	})

	.filter( o => {

		return !circles.some(circle => Math.abs(Math.sqrt( (o.x - circle.x)**2 + ( o.y - circle.y)**2 ) - circle.r) < 5)
	})

const count = sorted.length

// sorted.forEach( (p, i) => {

// 	const r = 1.2
// 	ctx.fillStyle = i < count*0.11 ? palette.newsRed : ( i < count*0.89 ? palette.sportBlue : palette.orange )

// 	ctx.beginPath()
// 	ctx.arc( p.x, p.y, r, 0, 2*Math.PI )
// 	ctx.fill()
// 	ctx.closePath()

// })

// const fullRedraw = progress => {

// 	console.log('full redraw')

// 	ctx.clearRect(0, 0, width, height)

// 	shuffled.forEach( ( [x, y], i ) => {

// 		if(y > progress*height) {

// 			const r = maxR
// 			ctx.fillStyle = y > height*0.66 ? palette.sportBlue : palette.newsRed
// 			const alpha = 1 //y/height < progress ? 1 : 0.2
// 			ctx.globalAlpha = alpha
// 			ctx.beginPath()
// 			ctx.arc( x, y, r, 0, 2*Math.PI )
// 			ctx.fill()
// 			ctx.closePath()

// 		}

// 	})

// }



const updateDots = (progress, shouldRedraw) => {

		//ctx.clearRect(0, height*progress, width, height*progress + 100)

		sorted.forEach( (p, i) => {

			if(p.drawn || p.y > progress*height) { return }

      		p.drawn = true

			const r = radius/4
			ctx.fillStyle = i < count*0.11 ? '#c70000' : ( i < count*0.89 ? '#0084c6' : '#ed6300' )

			const alpha = 1 //y/height < progress ? 1 : 0.2

			ctx.globalAlpha = alpha

			ctx.beginPath()
			ctx.arc( p.x, p.y, r, 0, 2*Math.PI )
			ctx.fill()
			ctx.closePath()
		})

		circles.forEach(c => {

			if(c.drawn) { return }

			c.drawn = true

			ctx.beginPath()
			ctx.lineWidth = 2
			ctx.globalAlpha = 0.8
			ctx.strokeStyle = palette.sportBlue
			ctx.arc(c.x, c.y, c.r, 0, 2*Math.PI)
			ctx.stroke()
			ctx.closePath()

		})

}

let i = 0

const checkScroll = shouldRedraw => {

	const frameTop = window.frameElement.getBoundingClientRect().top

	progress = Math.max(progress, -1*(frameTop - vHeight*0.4) / height)

	updateDots(progress, shouldRedraw)

	annots.forEach( el => {

		if(frameTop + el.getBoundingClientRect().top < vHeight*0.4) {
			el.classList.add('ref-copy--visible')
		}
	})

	labels.forEach( el => {
		if(frameTop + el.getBoundingClientRect().top < vHeight*0.4) {
			el.classList.add('ref-label--visible')
		}
	})

	i = (i + 1) % 32

	window.requestAnimationFrame(() => checkScroll(i === 0))

}

window.requestAnimationFrame(checkScroll)

console.log('dots on screen: ', sorted.length)
