module.exports = (build) => {
  if (build.renderer) {
    build.renderer.blockquote = (string) => {
      return `
      <div class="ui floating message">
        <p>${string}</p>
      </div>
      `
    }
  }
}