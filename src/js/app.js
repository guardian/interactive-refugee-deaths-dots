import * as d3sc from 'd3-scale'
import * as d3se from 'd3-selection'

const d3 = Object.assign({}, d3sc, d3se)

import { $, $$ } from './util'

import palette from './palette'
import PoissonSampler from './poisson-disc-sampler'


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
const radius = Math.sqrt(1.75*height*width / ( Math.PI*34361*fac ) )

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

const count = sorted.length

const updateDots = (progress, shouldRedraw) => {

		//ctx.clearRect(0, height*progress, width, height*progress + 100)

		sorted.forEach( (p, i) => {

			if(p.drawn || p.y > progress*height) { return }

      		p.drawn = true

			const r = radius/4
			ctx.fillStyle = i < count*0.11 ? '#c70000' : ( i < count*0.89 ? '#0084c6' : '#ed6300' )

			ctx.beginPath()
			ctx.arc( p.x, p.y, r, 0, 2*Math.PI )
			ctx.fill()
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
