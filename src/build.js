const fs = require('fs')
const pug = require('pug')
const path = require('path')
const lodash = require('lodash')
const debug = require('debug')('publish-workflowy:build')

class Builder {
  constructor (opt = {}) {
    this.templateEngine = 'pug'
    this.templateBasePath = opt.templateBasePath || path.join(process.cwd(), './templates')
    this.content = opt.content || {} 
    this.marked = require('marked')
    this.renderer = new (this.marked).Renderer()
    debug('%O', this)
  }
  
  render (templateName, locals = {}) {
    const prebuildScriptPath = path.join(this.templateBasePath, templateName, 'prebuild.js')
    debug(prebuildScriptPath)
    if (fs.existsSync(prebuildScriptPath)) {
      require(prebuildScriptPath)(this)
    }

    locals._ = lodash
    locals.moment = require('moment')
    // TODO: check path if git-repo, npm package or not
    // add custom level handling
    const files = []

    const has_route = (e) => {
      return (e.note && e.note[0] == '/')
    }
    const _render = (parent = null, content, level=1) => {
      content.has_route = has_route(content)
      if(content.has_route){
        content.path = path.join(content.note.split(' ')[0] + '.html').slice(1)
        // remove code from note
        content.note = content.note.slice(content.note.split(' ')[0].length)
        content.note = content.note.replace(/&gt;+/g, '>')
      }else{
        content.path = content.id+'.html'
      }
      
      content.level = level
      if(parent){
        content.parent = {
          path: parent.path,
          level: parent.level,
          title: parent.title,
        }
      }

      content.note = this.marked(content.note, {
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        breaks: true,
        smartypants: true,
        smartLists: true,
        renderer: this.renderer,
      })
      
      // let has_level = false
      // if(content.note && (content.note[0] == '#') && (+content.note[1]-1) === +level){
      //   has_level = true
      //   debug(has_level)
      // }
      if(content.children && content.children.length){
        content.children = content.children
          .filter((subcontent) => {
            // completed list will be hidden
            return subcontent.is_completed !== true
          })
          .map((subcontent) => {
            if(has_route(subcontent)){
              return _render(content, subcontent, level+1)
            }
            return subcontent
          })
      }
      
      files.push({
        path: content.path,
        html: pug.renderFile(
          path.join(this.templateBasePath, templateName, level+'.pug'), 
          Object.assign({
            title: content.name,
          }, locals, content),
        )
      })
      
      return content
    }
  
    // add filename to content
    this.content.id = 'index'
    const root = _render(null, this.content)
    debug('%O', root)

    /*
     * [{filename:'',html:''}]
     */
    return files
  }
}
module.exports = Builder