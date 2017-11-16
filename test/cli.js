require('debugs/init')
const assert = require('chai').assert
const debug = require('debug')('publish-workflowy:test')

const publishWorkflowy = require('../index.js')

describe('publish-workflowy', () => {
  describe('cli', () => {
    it('get version', async () => {
      outputs = []
      await publishWorkflowy.cli((output) => {
        outputs.push(output)
      }, {
        v: true,
        _: [],
      })
      assert.include(outputs[0], 'Version')
    })

    it('error without url', async () => {
      outputs = []
      await publishWorkflowy.cli((output) => {
        outputs.push(output)
      }, {
        _: [],
      })
      debug(outputs)
      assert.include(outputs[0], 'Usage')
    })

    it('build shared secret readonly url', async () => {
      /*
      node bin/wf https://workflowy.com/s/Npp.UIArYtyUcn \
         --template=as-is \
         --build.templateBasePath=./test/templates \
         --output=./test/temp
      */
      outputs = []
      await publishWorkflowy.cli((...a) => {
        outputs.push(...a)
      }, {
        _: ['https://workflowy.com/s/Npp.UIArYtyUcn'],
        template: 'as-is',
        build: {
          templateBasePath: __dirname + '/templates'
        }
      })
      assert.include(outputs[0], '[1/')
      assert.include(outputs[2], '[2/')
      assert.include(outputs[4], '[3/')
      assert.isArray(outputs[6])
      assert.property(outputs[6][0], 'filename')
      assert.property(outputs[6][0], 'html')
      assert.include(outputs[6][0].html, 'name=')
      debug(outputs)
    })

    it('build #1~9 level', async () => {
      /*
      node bin/wf https://workflowy.com/s/Npp.U8lS6ulstF \
         --template=level-level \
         --build.templateBasePath=./test/templates \
         --output=./test/temp
         --configure=./test/config.yml
      */
      outputs = []
      await publishWorkflowy.cli((...a) => {
        outputs.push(...a)
      }, {
        _: ['https://workflowy.com/s/Npp.U8lS6ulstF'],
        template: 'level-level',
        build: {
          templateBasePath: __dirname + '/templates'
        }
      })
      assert.include(outputs[0], '[1/')
      assert.include(outputs[2], '[2/')
      assert.include(outputs[4], '[3/')
      assert.isArray(outputs[6])
      assert.property(outputs[6][0], 'filename')
      assert.property(outputs[6][0], 'html')
      assert.include(outputs[6][0].html, 'name=')
      debug(outputs)
    })
    
  }).timeout(10000)
})