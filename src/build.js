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

    const _render = (parent = null, content, level=1) => {
      content.path = content.id+'.html'
      content.level = level
      if(parent){
        content.parent = {
          path: parent.path,
        }
      }
      
      // let has_level = false
      // if(content.note && (content.note[0] == '#') && (+content.note[1]-1) === +level){
      //   has_level = true
      //   debug(has_level)
      // }
      if(content.children && content.children.length){
        content.children = content.children.map((subcontent) => {
          if(subcontent.note && (subcontent.note[0] == '#') && (+subcontent.note[1]) === +level+1){
            return _render(content, subcontent, level+1)
          }else{
            return subcontent
          }
        })
      }
      
      files.push({
        path: content.path,
        html: pug.renderFile(
          path.join(this.templateBasePath, templateName, level+'.pug'), 
          _.merge(locals, content),
        )
      })
      
      return content
    }
  
    // add filename to content
    this.content.id = 'index'
    const root = _render(null, this.content)
    debug('%j', root)

    /*
     * [{filename:'',html:''}]
     */
    return files
  }
}
module.exports = Builder