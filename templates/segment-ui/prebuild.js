module.exports = (build) => {
  if (build.renderer) {
    build.renderer.blockquote = (string) => {
      return `
      <div class="ui floating message">
        <p>${string}</p>
      </div>
      `
    }
    build.renderer.hr = () => {
      return `
      <div class="ui divider"></div>
      `
    }
  }
}