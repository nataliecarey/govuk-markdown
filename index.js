const highlightJs = require('highlight.js')
const { Renderer } = require('marked').marked

/**
 * Creates a new marked Renderer. Adds GOV.UK typography classes to block
 * quotes, headings, paragraphs, links, lists, section breaks and tables and
 * updates references to local files in links and images to friendly URLs.
 *
 * @class
 */
module.exports = class GovukHTMLRenderer extends Renderer {
  // Block quotes
  blockquote (quote) {
    return `<blockquote class="govuk-inset-text govuk-!-margin-left-0">${quote}</blockquote>`
  }

  // Headings
  heading (text, level, string, slugger) {
    // Headings can start with either `xl` or `l` size modifier
    const modifiers = [
      ...(this.options.headingsStartWith === 'xl' ? ['xl'] : []),
      'l',
      'm'
    ]
    const modifier = modifiers[level - 1] || 's'
    const id = slugger.slug(text)
    return `<h${level} class="govuk-heading-${modifier}" id="${id}">${text}</h${level}>`
  }

  // Paragraphs
  paragraph (string) {
    // Don’t place figure (or figure within an anchor) within paragraph
    const FIGURE_RE = /(<a([^>]+)>)?<figure/
    if (FIGURE_RE.test(string)) {
      return string
    } else {
      return `<p class="govuk-body">${string}</p>`
    }
  }

  // Links
  link (href, title, text) {
    if (title) {
      return `<a class="govuk-link" href="${href}" title="${title}">${text}</a>`
    } else {
      return `<a class="govuk-link" href="${href}">${text}</a>`
    }
  }

  // Lists
  list (body, ordered) {
    const element = ordered ? 'ol' : 'ul'
    const modifier = ordered ? 'number' : 'bullet'

    return `<${element} class="govuk-list govuk-list--${modifier}">${body}</${element}>`
  }

  // Checkbox
  checkbox (checked) {
    return `<span class="x-govuk-checkbox"><input class="x-govuk-checkbox__input" type="checkbox"${checked ? ' checked' : ''} disabled><span class="x-govuk-checkbox__pseudo"></span></span>`
  }

  // Section break
  hr () {
    return '<hr class="govuk-section-break govuk-section-break--xl govuk-section-break--visible">'
  }

  // Tables
  table (header, body) {
    return `<table class="govuk-table">
      <thead class="govuk-table__head">${header}</thead>
      <tbody class="govuk-table__body">${body}</tbody>
    </table>`
  }

  tablerow (content) {
    return `<tr class="govuk-table__row">${content}</tr>`
  }

  tablecell (content, { header, align }) {
    const element = header ? 'th' : 'td'
    const className = header ? 'govuk-table__header' : 'govuk-table__cell'
    const alignClass = align ? ` govuk-!-text-align-${align}` : ''
    return `<${element} class="${className}${alignClass}">${content}</${element}>`
  }

  // Block code
  // By not using marked’s `highlight` option, we can add a class to the container
  code (string, language) {
    highlightJs.configure({ classPrefix: 'x-govuk-code__' })

    if (language) {
      // Code language has been set, or can be determined
      let code
      if (highlightJs.getLanguage(language)) {
        code = highlightJs.highlight(string, { language }).value
      } else {
        code = highlightJs.highlightAuto(string).value
      }
      return `<pre class="x-govuk-code x-govuk-code--block" tabindex="0"><code class="x-govuk-code__language--${language}">${code}</code></pre>`
    } else {
      // No language found, so render as plain text
      return `<pre class="x-govuk-code x-govuk-code--block" tabindex="0">${string}</pre>`
    }
  }

  // Inline code
  codespan (code) {
    return `<code class="x-govuk-code x-govuk-code--inline">${code}</code>`
  }
}
