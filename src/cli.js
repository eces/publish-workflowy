require('debugs/init')

const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const debug = require('debug')('publish-workflowy:cli')
const Workflowy = require('node-workflowy')

const Build = require('./build')

module.exports = async function(output = console.log) {
  if (argv.v || argv.version) {
    output(chalk.green(`
    Version ${require('./package.json').version}
    `.trim()))
    return
  }
  
  if (argv._.length != 1) {
    output(
      chalk.green(`Usage:`),
      `
      wf <options> [url]
      `,
    )
    return
  }
  
  // get list
  output(
    chalk.dim(`[1/4]`),
    '🔍  Resolving packages...',
  )
  // /4] 🔍  Resolving packages...
  // [2/4] 🚚  Fetching packages...
  // [3/4] 🔗  Linking dependencies...
  // [4/4] 📃  Building fresh p
  // throw new Error('sdf')
  const workflowy = new Workflowy
  try {
    output(process.cwd())
    const list = await workflowy.findUrl(argv._[0])
    output(list)

    output(
      chalk.dim(`[2/4]`),
      '🚚  Fetching packages...',
    )
    // get locals
    const config = argv.c || argv.config || argv.configure
    let locals = null
    if (config) {
      locals = yaml.safeLoad(fs.readFileSync(config), 'utf8')
    }
  
    // build
    const build = new Build({
      content: list
    })
    const template = argv.t || argv.template || 'segment-ui'
    const files = build.render(template, config)
  
    // post process -> save output
    output(
      chalk.dim(`[3/4]`),
      '🔗  Linking dependencies...',
    )
    const outputPath = argv.o || argv.out || argv.output || argv.dest
    if (outputPath) {
      files.forEach(e => {
        fs.writeFileSync(path.join(process.cwd(), outputPath, e.filename), e.html)
      })
    } else {
      output(files)
    }
      

  } catch (error) {
    debug(error)
    console.log(
      chalk.redBright('Failed:'),
      `
      ${error.message}
      `
    )
  }

  
  console.dir(argv)
  // const program = require('commander')
  
  // program
  //   .version(require('./package.json').version)
  //   .option('-u')
  
  
  // /*
  //  * -
  //  */
}