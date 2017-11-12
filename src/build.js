const pug = require('pug')
const path = require('path')
const yaml = require('js-yaml')
const debug = require('debug')('publish-workflowy:build')
const _ = require('lodash')

class Builder {
  constructor (opt = {}) {
    this.templateEngine = 'pug'
    this.templateBasePath = opt.templateBasePath || path.join(process.cwd(), './templates')
    this.content = opt.content || {} 
    debug('%O', this)
  }
  
  render (templateName, locals = {}) {
    locals._ = _
    // TODO: check path if git-repo, npm package or not
    // add custom level handling
    const files = []

    const _render = (content, level=0) => {
      content.filename = content.id+'.html'
      files.push({
        filename: content.filename,
        html: pug.renderFile(
          path.join(this.templateBasePath, templateName, level+'.pug'), 
          _.merge(locals, content),
        )
      })
      let has_level = false
      if(content.note[0] == '#' && content.note[1]+1 === level){
        has_level = true
      }
      if(has_level && content.children && content.children.length){
        content.children.forEach(_render, level+1)
      }
    }
  
    // add filename to content
    this.content.id = 'index'
    _render(this.content)

    /*
     * [{filename:'',html:''}]
     */
    return files
  }
}
module.exports = Builder