'use strict'


const _ = require('lodash')
const fs = require('fs')
const glpk = require('glpk')

const glpkjs = require('../glpk.js')

describe('test the solver', function() {
    
    it('Solver should have similar results to the node-glpk', function() {
        return glpkjs.then(glpkjs => {
        
            const problemInstances = [
                'lp',
                'diet_large',
                'mip',
                'mip2'
            ]
            _.map(problemInstances, instance => {
                const json = JSON.parse(fs.readFileSync(`${__dirname}/data/${instance}.json`).toString())
                
                const prob = new glpk.Problem()
                prob.readLpSync(`${__dirname}/data/${instance}.lp`)
                prob.scaleSync(glpk.SF_AUTO)
                prob.simplexSync({
                    presolve: glpk.ON,
                    msgLev: glpk.MSG_ERR
                })
                let glpkObjValue
                if (prob.getNumInt() > 0) {
                    prob.intoptSync()
                    glpkObjValue = prob.mipObjVal()
                } else {
                    glpkObjValue = prob.getObjVal()
                }
                prob.delete()
                
                const settings = json.settings
                const glpkJsSol = glpkjs.solve(json, settings)
                expect(_.round(glpkJsSol.result.z, 2)).to.be.equal(_.round(glpkObjValue, 2))
            })
        })
    })

    it('The time limit should kill the solver before finding optimal solution', function() {
        const problem = 'mip2'
        const json = JSON.parse(fs.readFileSync(`${__dirname}/data/${problem}.json`).toString())
        const settings = _.defaults({tmLim: 1}, json.settings)
        
        
        return glpkjs.then(glpkjs => {
            const sol = glpkjs.solve(json, settings)
            expect(sol.result.status).be.equal(1)
            expect(sol.result.vars.x1).be.equal(0)
            expect(sol.result.z).be.equal(0)
        })
    })
})
