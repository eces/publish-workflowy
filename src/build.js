const pug = require('pug')
const path = require('path')
const yaml = require('js-yaml')
const _ = require('lodash')

class Builder {
  constructor (opt) {
    this.templateEngine = 'pug'
    this.content = opt.content || {} 
  }
  
  render (templateName, locals = {}) {
    locals._ = _
    // TODO: check path if git-repo, npm package or not
    // add custom level handling
    const files = []
    // const html = pug.render(
    //   path.join('../templates', path, '0.pug'), 
    //   _.merge(this.content, locals)
    // )

    // add filename to content
    this.content.filename = 'index.html'
    files.push({
      filename: this.content.filename,
      html: pug.renderFile(
        path.join(__dirname, '../templates', templateName, '0.pug'), 
        _.merge(this.content, locals),
      ),
    })
    if(this.content.children){
      this.content.children.forEach(content => {
        content.filename = content.id+'.html'
        files.push({
          filename: content.filename,
          html: pug.renderFile(
            path.join(__dirname, '../templates', templateName, '1.pug'), 
            _.merge(content, locals),
          )
        })
      })
    }
    /*
     * [{filename:'',html:''}]
     */
    return files
  }
}
module.exports = Builder